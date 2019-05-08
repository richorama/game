const twopi = 2 * Math.PI
const et = require('eventthing')
const maths = require('../engine/maths')

module.exports = props => {
  let { position, speed, radius, colour, upgrade } = props
  let [x, y] = position
  let life = 0

  const calculatePosition = ctx => {
    const newHeading = maths.calculateTrajectory(
      [x, y],
      [window.innerWidth / 2, window.innerHeight / 2],
      speed / ctx.timeSinceLastFrame
    )
    x += newHeading[0]
    y += newHeading[1]
  }

  const instance = {
    hit: sprite => {
      et.fire('upgrade', upgrade), instance.removeFromLayer()
      et.fire('display_text', {
        position: [x + 15, y + 15],
        colour,
        text: upgrade.text,
        velocity: [0, -10]
      })
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
      
      ctx.buffer.strokeStyle = '#fff'
      if (Math.floor(life / 500) % 5 === 0) {
        ctx.buffer.lineWidth = 1
        ctx.buffer.beginPath()
        ctx.buffer.arc(x, y, (life % 500) / 20, 0, twopi)
        ctx.buffer.stroke()
      }

      ctx.buffer.fillStyle = colour
      ctx.buffer.lineWidth = 1
      ctx.buffer.beginPath()
      ctx.buffer.arc(x, y, radius, 0, twopi)
      ctx.buffer.stroke()
      ctx.buffer.fill()

      if (Math.floor(ctx.gameTime / 400) % 2 === 0) {
        ctx.buffer.strokeStyle = colour
        ctx.buffer.fillText('UPGRADE', x + 15, y - 15)
      }
      life += ctx.timeSinceLastFrame
    }
  }
  return instance
}
