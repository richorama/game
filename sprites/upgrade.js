const twopi = 2 * Math.PI
const et = require('eventthing')
const maths = require('../engine/maths')

module.exports = props => {
  let { position, speed, radius, colour, upgrade } = props
  let [x, y] = position

  const calculatePosition = ctx => {
    const newHeading = maths.calculateTrajectory(
      [x, y],
      ctx.ship.getPosition(),
      speed / ctx.timeSinceLastFrame
    )
    x += newHeading[0]
    y += newHeading[1]
  }

  const instance = {
    hit: sprite => {
      et.fire('upgrade', upgrade), instance.removeFromLayer()
    },
    getDamage: () => 0,
    getExtent: () => {
      return {
        x,
        y,
        radius
      }
    },
    render: ctx => {
      calculatePosition(ctx)
      const value = Math.round((255 * Math.sin(ctx.gameTime / 100)) / 2 + 1)
      ctx.buffer.fillStyle = colour
      ctx.buffer.strokeStyle = `rgb(${value}, ${value}, ${value})`
      ctx.buffer.lineWidth = 3
      ctx.buffer.beginPath()
      ctx.buffer.arc(x, y, radius, 0, twopi)
      ctx.buffer.stroke()
      ctx.buffer.fill()
    }
  }
  return instance
}
