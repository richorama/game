const constants = require('../engine/constants')
const twopi = 2 * Math.PI

module.exports = props => {
  let { position, velocity, radius, colour, damage } = props
  let [x, y] = position
  const [dx, dy] = velocity

  const calculatePosition = dt => {
    x += velocity[0] / dt
    y += velocity[1] / dt

    if (dx > 0 && x > constants.width) return instance.removeFromLayer()
    if (dx < 0 && x < 0) return instance.removeFromLayer()
    if (dy > 0 && y > constants.height) return instance.removeFromLayer()
    if (dy < 0 && y < 0) return instance.removeFromLayer()
  }

  const instance = {
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
      ctx.buffer.fillStyle = colour
      ctx.buffer.beginPath()
      ctx.buffer.arc(x, y, radius, 0, twopi)
      ctx.buffer.fill()
    }
  }
  return instance
}
