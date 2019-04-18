const twopi = 2 * Math.PI
const constants = require('../engine/constants')

const Spec = props => {
  let { position, velocity, colour } = props

  const calculatePosition = dt => {
    position[0] += velocity[0] / dt
    position[1] += velocity[1] / dt
  }

  return {
    render: (ctx, life) => {
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.fillStyle = colour
      ctx.buffer.beginPath()
      ctx.buffer.arc(position[0], position[1], (500 - life) / 40, 0, twopi)
      ctx.buffer.fill()
    }
  }
}

module.exports = props => {
  let { position, velocity, colour, size } = props
  let [x, y] = position
  const [dx, dy] = velocity
  let life = 0
  const childSprites = []
  const specSpeed = 50
  const specCount = 20

  for (var i = 0; i < specCount * size; i++) {
    childSprites.push(
      Spec({
        colour,
        position: [x, y],
        velocity: [
          velocity[0] + specSpeed * (Math.random() - 0.5),
          velocity[1] + specSpeed * (Math.random() - 0.5)
        ]
      })
    )
  }

  const calculatePosition = dt => {
    x += velocity[0] / dt
    y += velocity[1] / dt

    if (dx > 0 && x > constants.width) return instance.removeFromLayer()
    if (dx < 0 && x < 0) return instance.removeFromLayer()
    if (dy > 0 && y > constants.height) return instance.removeFromLayer()
    if (dy < 0 && y < 0) return instance.removeFromLayer()
  }

  const instance = {
    render: ctx => {
      calculatePosition(ctx.timeSinceLastFrame)

      if (size >= 1) {
        ctx.buffer.strokeStyle = '#ffffff'
        ctx.buffer.lineWidth = 2
        ctx.buffer.beginPath()
        ctx.buffer.arc(x, y, life / 5, 0, twopi)
        ctx.buffer.stroke()
      }
      childSprites.forEach(x => x.render(ctx, life))

      life += ctx.timeSinceLastFrame
      if (life > 500) instance.removeFromLayer()
    }
  }
  return instance
}
