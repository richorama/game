module.exports = props => {
  let { x, y } = props

  return {
    render: ctx => {
      ctx.canvas.fillStyle = '#cccccc'
      ctx.canvas.fillRect(x, y, 25, 25)
    }
  }

}