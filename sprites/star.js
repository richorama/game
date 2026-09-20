const twopi = 2 * Math.PI

module.exports = props => {
  let { x, y, speed, radius, colour } = props

  const calculatePosition = dt => {
    y += speed * dt / 1000
    if (y - radius * 2 > window.innerHeight) {
      y = radius * -2
      x = Math.random() * window.innerWidth
    }
  }

  return {
    render: ctx => {
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.save()
      ctx.buffer.globalAlpha = 0.65 + Math.sin(ctx.gameTime / 700 + x) * 0.3
      ctx.buffer.fillStyle = colour
      if (radius > 2) {
        ctx.buffer.strokeStyle = colour
        ctx.buffer.lineWidth = 1
        ctx.buffer.beginPath()
        ctx.buffer.moveTo(x, y)
        ctx.buffer.lineTo(x, y - radius * 4)
        ctx.buffer.stroke()
      }
      ctx.buffer.beginPath()
      ctx.buffer.arc(x, y, radius, 0, twopi)
      ctx.buffer.fill()
      ctx.buffer.restore()
    }
  }
}
