module.exports = (buffer, props) => {
  const { x, y, velocity, radius, colour, length, end, beam = false } = props
  const angle = Math.atan2(velocity[1], velocity[0])
  const [tailX, tailY] = end || [
    x - Math.cos(angle) * length,
    y - Math.sin(angle) * length
  ]

  buffer.save()
  if (beam) buffer.globalCompositeOperation = 'lighter'
  buffer.lineCap = 'round'
  buffer.shadowColor = colour
  buffer.shadowBlur = 14
  const trail = buffer.createLinearGradient(tailX, tailY, x, y)
  trail.addColorStop(0, beam ? colour : 'transparent')
  trail.addColorStop(1, colour)
  buffer.strokeStyle = trail
  buffer.lineWidth = radius * 2
  buffer.beginPath()
  buffer.moveTo(tailX, tailY)
  buffer.lineTo(x, y)
  buffer.stroke()
  if (!beam) {
    buffer.fillStyle = colour
    buffer.beginPath()
    buffer.arc(x, y, radius, 0, Math.PI * 2)
    buffer.fill()
  }
  buffer.shadowBlur = 0
  if (beam) {
    buffer.strokeStyle = '#ffffff'
    buffer.lineWidth = radius * 0.7
    buffer.beginPath()
    buffer.moveTo(tailX, tailY)
    buffer.lineTo(x, y)
    buffer.stroke()
  } else {
    buffer.fillStyle = '#ffffff'
    buffer.beginPath()
    buffer.arc(x, y, Math.max(2, radius * 0.45), 0, Math.PI * 2)
    buffer.fill()
  }
  buffer.restore()
}
