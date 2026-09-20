module.exports = (ctx, props) => {
  const { position: [x, y], age, remaining, white = false, label } = props
  const buffer = ctx.buffer
  buffer.save()
  buffer.translate(x, y)
  buffer.globalAlpha = Math.max(0, Math.min(1, remaining / 1000))
  buffer.strokeStyle = white ? '#c7ffff' : '#be9bff'
  buffer.shadowColor = white ? '#8fffff' : '#ac7aff'
  buffer.shadowBlur = white ? 24 : 16
  buffer.lineWidth = 2
  for (let i = 0; i < 4; i++) {
    const orbit = 36 + i * 10
    const angle = age / (240 + i * 60) * (white ? -1 : 1) + i
    buffer.beginPath()
    buffer.ellipse(0, 0, orbit, orbit * 0.5, angle, 0, Math.PI * 1.6)
    buffer.stroke()
  }
  buffer.beginPath()
  buffer.arc(0, 0, 24, 0, Math.PI * 2)
  buffer.fillStyle = white ? '#efffff' : age < 1500 ? '#33234c' : '#02020a'
  buffer.fill()
  buffer.stroke()
  buffer.shadowBlur = 0
  buffer.font = '11px Orbitron, monospace'
  buffer.textAlign = 'center'
  buffer.fillStyle = white ? '#dfffff' : '#d9c6ff'
  buffer.fillText(age < 1500 ? 'GRAVITY WELL FORMING' : label, 0, -75)
  buffer.restore()
}
