const et = require('eventthing')
const Bullet = require('./bullet')
const GravityMotion = require('../engine/gravity_motion')

module.exports = props => {
  const [startX, startY] = props.position
  let x = startX
  let y = startY
  let age = 0
  let lastFired = 0
  let energy = 65
  const gravity = GravityMotion()
  let driftX = 0
  let driftY = 0
  const instance = {
    accelerate: gravity.accelerate,
    getPosition: () => [x, y],
    getExtent: () => ({ x, y, radius: 25 }),
    getDamage: () => 18,
    hit: sprite => {
      if (instance.destroyed) return
      energy -= sprite.getDamage()
      et.fire('explosion', {
        position: [x, y], velocity: [0, 35], colour: '#ffbc59', size: energy <= 0 ? 1 : 0.1
      })
      if (energy <= 0) {
        instance.removeFromLayer()
        et.fire('enemy_destroyed', 225)
      }
    },
    fire: ctx => {
      if (age < 1500 || y < 0 || ctx.gameTime - lastFired < 2100) return []
      lastFired = ctx.gameTime
      return Array.from({ length: 6 }, (_, i) => {
        const angle = age / 800 + i * Math.PI / 3
        return Bullet({
          position: [x, y], velocity: [Math.cos(angle) * 190, Math.sin(angle) * 190],
          radius: 5, colour: '#ffbc59', damage: 5
        })
      })
    },
    render: ctx => {
      age += ctx.timeSinceLastFrame
      const [pullX, pullY] = gravity.step(ctx.timeSinceLastFrame)
      driftX += pullX
      driftY += pullY
      x = Math.max(35, Math.min(window.innerWidth - 35, startX + Math.sin(age / 800) * 110 + driftX))
      y = startY + age * 0.045 + driftY
      if (y > window.innerHeight + 60) return instance.removeFromLayer()
      const buffer = ctx.buffer
      buffer.save()
      buffer.translate(x, y)
      buffer.rotate(age / 700)
      buffer.shadowColor = '#ffbc59'
      buffer.shadowBlur = 14
      buffer.strokeStyle = '#ffbc59'
      buffer.fillStyle = '#402b32'
      buffer.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        buffer.rotate(Math.PI * 2 / 3)
        buffer.beginPath()
        buffer.moveTo(8, -8)
        buffer.lineTo(34, -20)
        buffer.lineTo(26, 16)
        buffer.lineTo(8, 8)
        buffer.closePath()
        buffer.fill()
        buffer.stroke()
      }
      buffer.fillStyle = '#fff0ba'
      buffer.beginPath()
      buffer.arc(0, 0, 9, 0, Math.PI * 2)
      buffer.fill()
      buffer.restore()
    }
  }
  return instance
}
