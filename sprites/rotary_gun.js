const Bullet = require('./bullet')
const et = require('eventthing')

module.exports = () => {
  let lastFired = -Infinity
  return {
    fire: ctx => {
      if (ctx.gameTime - lastFired < 80) return []
      lastFired = ctx.gameTime
      const [x, y] = ctx.ship.getPosition()
      return [0, Math.PI].map(offset => {
        const angle = ctx.gameTime / 600 + offset
        const position = [x + Math.cos(angle) * 32, y + Math.sin(angle) * 32]
        et.fire('weapon_fire', { kind: 'rotary', colour: '#87ffe4', position })
        return Bullet({
          position, velocity: [Math.cos(angle) * 420, Math.sin(angle) * 420],
          damage: 2, radius: 4, colour: '#87ffe4'
        })
      })
    },
    render: ctx => {
      if (ctx.ship.isDestroyed()) return
      const [x, y] = ctx.ship.getPosition()
      const buffer = ctx.buffer
      buffer.save()
      buffer.translate(x, y)
      buffer.rotate(ctx.gameTime / 600)
      buffer.strokeStyle = '#87ffe4'
      buffer.lineWidth = 2
      buffer.beginPath()
      buffer.arc(0, 0, 32, 0, Math.PI * 2)
      buffer.stroke()
      buffer.fillStyle = '#d9fff6'
      buffer.fillRect(-38, -3, 10, 6)
      buffer.fillRect(28, -3, 10, 6)
      buffer.restore()
    }
  }
}
