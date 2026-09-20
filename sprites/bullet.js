const drawProjectile = require('./projectile')

module.exports = props => {
  let { position, velocity, radius, colour, damage, pierce = 1, trailLength } = props
  const hitTargets = new Set()
  let [x, y] = position
  let [dx, dy] = velocity

  const calculatePosition = dt => {
    x += dx * dt / 1000
    y += dy * dt / 1000

    if (x > window.innerWidth + 60 || x < -60 ||
        y > window.innerHeight + 60 || y < -60) instance.removeFromLayer()
  }

  const instance = {
    isProjectile: true,
    teleport: (position, direction) => {
      x = position[0]
      y = position[1]
      const speed = Math.hypot(dx, dy)
      dx = direction[0] * speed
      dy = direction[1] * speed
    },
    accelerate: (ax, ay, dt) => {
      dx += ax * dt / 1000
      dy += ay * dt / 1000
    },
    canHit: sprite => !hitTargets.has(sprite),
    hit: sprite => {
      hitTargets.add(sprite)
      pierce--
      if (pierce <= 0) instance.removeFromLayer()
    },
    getDamage: () => damage,
    getExtent: () => {
      return {
        x,
        y,
        radius
      }
    },
    render: ctx => {
      calculatePosition(ctx.timeSinceLastFrame)
      drawProjectile(ctx.buffer, {
        x, y, velocity: [dx, dy], radius, colour, length: trailLength || Math.max(22, radius * 5)
      })
    }
  }
  return instance
}
