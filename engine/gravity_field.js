const { overlap } = require('./hit_detection')

module.exports = (ctx, layers, props) => {
  const { position: [x, y], radius, range, strength, repel = false, absorb = false, enter } = props
  layers.forEach(layer => layer.all().forEach(sprite => {
    if (sprite.destroyed || !sprite.accelerate || (sprite.isPlayer && sprite.isDestroyed())) return
    const extent = sprite.getExtent()
    if (overlap(extent, { x, y, radius })) {
      if (enter && enter(sprite)) return
      if (absorb && sprite.isProjectile) return sprite.removeFromLayer()
    }
    const dx = x - extent.x
    const dy = y - extent.y
    const distance = Math.hypot(dx, dy)
    if (distance === 0 || distance >= range) return
    const acceleration = strength * (1 - distance / range) * (repel ? -1 : 1)
    sprite.accelerate(dx / distance * acceleration, dy / distance * acceleration, ctx.timeSinceLastFrame)
  }))
}
