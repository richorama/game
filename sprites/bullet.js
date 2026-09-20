const drawProjectile = require('./projectile')

module.exports = props => {
  let { position, velocity, radius, colour, damage } = props
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
    accelerate: (ax, ay, dt) => {
      dx += ax * dt / 1000
      dy += ay * dt / 1000
    },
    hit: sprite => instance.removeFromLayer(),
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
        x, y, velocity: [dx, dy], radius, colour, length: Math.max(22, radius * 5)
      })
    }
  }
  return instance
}
