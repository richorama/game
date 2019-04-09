const twopi = 2 * Math.PI

module.exports = props => {
  let { position, velocity } = props
  let [x, y] = position
  const [dx, dy] = velocity
  let life = 0

  const calculatePosition = dt => {
    x += velocity[0] / dt
    y += velocity[1] / dt

    if (dx > 0 && x > window.innerWidth) return instance.removeFromLayer()
    if (dx < 0 && x < 0) return instance.removeFromLayer()
    if (dy > 0 && y > window.innerHeight) return instance.removeFromLayer()
    if (dy < 0 && y < 0) return instance.removeFromLayer()
  }

  const instance = {
    render: ctx => {
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.strokeStyle = '#fff'
      // ctx.buffer.lineWidth = 50 / (life + 1)
      ctx.buffer.beginPath()
      ctx.buffer.arc(x, y, life / 5, 0, twopi)
      ctx.buffer.stroke()

      life += ctx.timeSinceLastFrame

      if (life > 500){
        instance.removeFromLayer()
      }
    }
  }
  return instance
}
