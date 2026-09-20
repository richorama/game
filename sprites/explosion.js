const twopi = 2 * Math.PI

const Spec = props => {
  let { position, velocity, colour } = props

  const calculatePosition = dt => {
    position[0] += velocity[0] * dt / 1000
    position[1] += velocity[1] * dt / 1000
  }

  return {
    render: (ctx, life) => {
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.fillStyle = colour
      ctx.buffer.strokeStyle = colour
      ctx.buffer.lineWidth = 2
      ctx.buffer.beginPath()
      ctx.buffer.moveTo(position[0], position[1])
      ctx.buffer.lineTo(position[0] - velocity[0] * 0.045, position[1] - velocity[1] * 0.045)
      ctx.buffer.stroke()
      ctx.buffer.beginPath()
      ctx.buffer.arc(position[0], position[1], Math.max(0.5, (500 - life) / 160), 0, twopi)
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
  const specSpeed = 480
  const specCount = 24

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
    x += velocity[0] * dt / 1000
    y += velocity[1] * dt / 1000

    if (dx > 0 && x > window.innerWidth) return instance.removeFromLayer()
    if (dx < 0 && x < 0) return instance.removeFromLayer()
    if (dy > 0 && y > window.innerHeight) return instance.removeFromLayer()
    if (dy < 0 && y < 0) return instance.removeFromLayer()
  }

  const instance = {
    render: ctx => {
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.save()
      ctx.buffer.globalCompositeOperation = 'lighter'
      ctx.buffer.globalAlpha = Math.max(0, 1 - life / 500)
      ctx.buffer.shadowColor = colour
      ctx.buffer.shadowBlur = 12

      if (size >= 1) {
        ctx.buffer.strokeStyle = '#ffffff'
        ctx.buffer.lineWidth = 2
        ctx.buffer.beginPath()
        ctx.buffer.arc(x, y, life / 5, 0, twopi)
        ctx.buffer.stroke()
        ctx.buffer.strokeStyle = colour
        ctx.buffer.lineWidth = 4
        ctx.buffer.beginPath()
        ctx.buffer.arc(x, y, life / 8, 0, twopi)
        ctx.buffer.stroke()
      }
      childSprites.forEach(x => x.render(ctx, life))
      ctx.buffer.restore()

      life += ctx.timeSinceLastFrame
      if (life > 500) instance.removeFromLayer()
    }
  }
  return instance
}
