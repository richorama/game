module.exports = props => {
  const { position, colour } = props
  let age = 0
  const instance = {
    render: ctx => {
      age += ctx.timeSinceLastFrame
      if (age >= 90) return instance.removeFromLayer()
      const buffer = ctx.buffer
      const size = 18 * (1 - age / 90)
      buffer.save()
      buffer.translate(...position)
      buffer.globalCompositeOperation = 'lighter'
      buffer.strokeStyle = colour
      buffer.shadowColor = colour
      buffer.shadowBlur = 15
      buffer.lineWidth = 2
      buffer.beginPath()
      buffer.moveTo(-size, 0)
      buffer.lineTo(size, 0)
      buffer.moveTo(0, -size)
      buffer.lineTo(0, size)
      buffer.stroke()
      buffer.restore()
    }
  }
  return instance
}
