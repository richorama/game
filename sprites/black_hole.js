const { overlap } = require('../engine/hit_detection')

module.exports = props => {
  const { position } = props
  const [x, y] = position
  const radius = 24
  const range = 250
  let age = 0

  const instance = {
    update: (ctx, affectedLayers) => {
      age += ctx.timeSinceLastFrame
      if (age >= 11000) return instance.removeFromLayer()
      if (age < 1500) return
      affectedLayers.forEach(layer => layer.all().forEach(sprite => {
        if (sprite.destroyed || !sprite.accelerate || (sprite.isPlayer && sprite.isDestroyed())) return
        const extent = sprite.getExtent()
        const dx = x - extent.x
        const dy = y - extent.y
        const distance = Math.hypot(dx, dy)
        if (sprite.isProjectile && overlap(extent, { x, y, radius })) return sprite.removeFromLayer()
        if (distance === 0 || distance >= range) return
        const acceleration = 1600 * (1 - distance / range)
        sprite.accelerate(dx / distance * acceleration, dy / distance * acceleration, ctx.timeSinceLastFrame)
      }))
    },
    render: ctx => {
      const buffer = ctx.buffer
      const warning = age < 1500
      buffer.save()
      buffer.translate(x, y)
      buffer.globalAlpha = Math.min(1, (11000 - age) / 1000)
      buffer.strokeStyle = '#be9bff'
      buffer.shadowColor = '#ac7aff'
      buffer.shadowBlur = 16
      buffer.lineWidth = 2
      for (let i = 0; i < 4; i++) {
        const orbit = radius + 12 + i * 10
        const angle = age / (240 + i * 60) + i
        buffer.beginPath()
        buffer.ellipse(0, 0, orbit, orbit * 0.5, angle, 0, Math.PI * 1.6)
        buffer.stroke()
      }
      buffer.beginPath()
      buffer.arc(0, 0, radius, 0, Math.PI * 2)
      buffer.fillStyle = warning ? '#33234c' : '#02020a'
      buffer.fill()
      buffer.stroke()
      buffer.shadowBlur = 0
      buffer.font = '11px Orbitron, monospace'
      buffer.textAlign = 'center'
      buffer.fillStyle = '#d9c6ff'
      buffer.fillText(warning ? 'GRAVITY WELL FORMING' : 'GRAVITY WELL - FIGHT THE PULL', 0, -75)
      buffer.restore()
    }
  }
  return instance
}
