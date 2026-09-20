module.exports = props => {
  const { position, text, colour, velocity } = props
  let [x, y] = position
  let life = 0

  const calculatePosition = ctx => {
    x += velocity[0] * ctx.timeSinceLastFrame / 1000
    y += velocity[1] * ctx.timeSinceLastFrame / 1000
  }

  const instance = {
    render: ctx => {
      calculatePosition(ctx)

      ctx.buffer.fillStyle = colour
      ctx.buffer.fillText(text, x, y)
      life += ctx.timeSinceLastFrame

      if (life > 2000) {
        instance.removeFromLayer()
      }
    }
  }
  return instance
}
