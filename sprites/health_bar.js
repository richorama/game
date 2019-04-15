const colour = 'rgb(152, 195, 121)'

module.exports = props => {
  const { width, height, y } = props

  return {
    render: ctx => {
      const health = ctx.ship.getHealth()

      const x = (window.innerWidth - width) / 2

      ctx.buffer.beginPath()
      ctx.buffer.strokeStyle = colour
      ctx.buffer.rect(x - 4, y - 4, width + 4, height + 4)
      ctx.buffer.stroke()

      ctx.buffer.beginPath()
      ctx.buffer.fillStyle = colour
      ctx.buffer.rect(x - 2, y - 2, (width * health) / 100, height)
      ctx.buffer.fill()
    }
  }
}
