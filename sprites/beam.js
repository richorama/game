const drawProjectile = require('./projectile')

module.exports = props => {
  const { position, radius, colour, damage, age = 0, createdAt } = props
  const velocity = props.velocity.slice()
  let previous = props.previous
  let firstRender = true
  let x = position[0] + velocity[0] * age / 1000
  let y = position[1] + velocity[1] * age / 1000
  const endpoint = () => {
    if (previous && previous.destroyed) previous = null
    return previous ? previous.getPosition() : [x, y]
  }

  const calculatePosition = dt => {
    x += velocity[0] * dt / 1000
    y += velocity[1] * dt / 1000
    const [tailX, tailY] = endpoint()
    if (Math.min(x, tailX) - radius > window.innerWidth ||
        Math.max(x, tailX) + radius < 0 ||
        Math.min(y, tailY) - radius > window.innerHeight ||
        Math.max(y, tailY) + radius < 0) instance.removeFromLayer()
  }

  const instance = {
    isProjectile: true,
    accelerate: (ax, ay, dt) => {
      velocity[0] += ax * dt / 1000
      velocity[1] += ay * dt / 1000
    },
    hit: sprite => instance.removeFromLayer(),
    getDamage: () => damage,
    getPosition: () => [x, y],
    getExtent: () => {
      const [endX, endY] = endpoint()
      return {
        x,
        y,
        radius,
        endX,
        endY
      }
    },
    render: ctx => {
      calculatePosition(firstRender && createdAt === ctx.gameTime ? 0 : ctx.timeSinceLastFrame)
      firstRender = false
      if (instance.destroyed) return
      drawProjectile(ctx.buffer, {
        x, y, velocity, radius, colour, end: endpoint(), beam: true
      })
    }
  }
  return instance
}
