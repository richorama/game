const twopi = 2 * Math.PI
const et = require('eventthing')
const maths = require('../engine/maths')
const GravityMotion = require('../engine/gravity_motion')

module.exports = props => {
  let { position, speed, radius, colour, upgrade } = props
  let [x, y] = position
  let life = 0
  const gravity = GravityMotion()

  const calculatePosition = ctx => {
    const target = [position[0], window.innerHeight * 0.6]
    const distance = Math.hypot(target[0] - x, target[1] - y)
    const newHeading = maths.calculateTrajectory(
      [x, y],
      target,
      Math.min(distance, speed * ctx.timeSinceLastFrame / 1000)
    )
    const [pullX, pullY] = gravity.step(ctx.timeSinceLastFrame)
    x += newHeading[0] + pullX
    y += newHeading[1] + pullY
  }

  const instance = {
    accelerate: gravity.accelerate,
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
      
      ctx.buffer.save()
      ctx.buffer.shadowColor = colour
      ctx.buffer.shadowBlur = 20
      ctx.buffer.strokeStyle = '#fff'
      ctx.buffer.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        const angle = life / 350 + i * twopi / 3
        ctx.buffer.beginPath()
        ctx.buffer.arc(x, y, radius + 8, angle, angle + 0.9)
        ctx.buffer.stroke()
      }
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

      ctx.buffer.font = '13px Orbitron, monospace'
      ctx.buffer.textAlign = 'center'
      ctx.buffer.fillText(upgrade.text, x, y - 36)
      ctx.buffer.restore()
      life += ctx.timeSinceLastFrame
    }
  }
  return instance
}
