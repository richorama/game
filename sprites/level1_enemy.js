const twopi = 2 * Math.PI

module.exports = props => {
  let { position, speed, radius, colour } = props
  let [x, y] = position

  const calculatePosition = ctx => {
    const target = ctx.ship.getPosition()
    const dx = target[0] - x
    const dy = target[1] - y
    const heading = Math.atan2(dy, dx)
    x += speed * Math.cos(heading) / ctx.timeSinceLastFrame
    y += speed * Math.sin(heading) / ctx.timeSinceLastFrame
  }

  return {
    render: ctx => {
      calculatePosition(ctx)
      ctx.buffer.fillStyle = colour
      ctx.buffer.beginPath();
      ctx.buffer.arc(x, y, radius, 0, twopi);
      ctx.buffer.fill();
    }
  }

}