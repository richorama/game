const twopi = 2 * Math.PI

module.exports = props => {
  let { x, y, speed, radius, colour } = props

  const calculatePosition = dt => {
    y += speed / dt
    if (y - radius * 2 > window.innerHeight) {
      y = radius * -2
      x = Math.random() * window.innerWidth
    }
  }

  return {
    getExtent: () => {
      throw new Error('not implemented')
    },
    hit: () => {
      throw new Error('not implemented')
    },
    render: ctx => {
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.fillStyle = colour
      ctx.buffer.beginPath()
      ctx.buffer.arc(x, y, radius, 0, twopi)
      ctx.buffer.fill()
    }
  }
}
