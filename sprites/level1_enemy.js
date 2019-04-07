const twopi = 2 * Math.PI

module.exports = props => {
  let { position, speed, radius, colour } = props
  let [x, y] = position

  const calculatePosition = ctx => {
    const target = ctx.ship.getPosition()
    const heading = Math.atan2(target[1] - y, target[0] - x)
    x += speed * Math.cos(heading) / ctx.timeSinceLastFrame
    y += speed * Math.sin(heading) / ctx.timeSinceLastFrame
  }

  return {
    fire: ctx => {
      
    },
    render: ctx => {
      calculatePosition(ctx)
      ctx.buffer.fillStyle = colour
      ctx.buffer.beginPath();
      ctx.buffer.arc(x, y, radius, 0, twopi);
      ctx.buffer.fill();
    }
  }

}