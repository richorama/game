const et = require('eventthing')
const Bullet = require('./bullet')
const maths = require('../engine/maths')
const GravityMotion = require('../engine/gravity_motion')
const img = new Image()
img.src = 'svg/hive_queen.svg'

module.exports = () => {
  const maxEnergy = 2600
  let energy = maxEnergy
  let x = window.innerWidth / 2
  let y = -120
  let age = 0
  let lastFired = 0
  let volleys = 0
  let phase = 1
  const gravity = GravityMotion()
  let driftX = 0
  let driftY = 0
  const colour = () => ['#d994ff', '#ff9dd8', '#ff805f'][phase - 1]

  const instance = {
    isBoss: true,
    accelerate: gravity.accelerate,
    getPosition: () => [x, y],
    getExtent: () => ({ x, y, radius: 82 }),
    getHealth: () => energy,
    getMaxHealth: () => maxEnergy,
    getPhase: () => phase,
    getDamage: () => 25,
    hit: sprite => {
      if (instance.destroyed || sprite.isPlayer) return
      energy = Math.max(0, energy - sprite.getDamage())
      if (energy === 0) {
        instance.removeFromLayer()
        for (const offset of [-65, 0, 65]) et.fire('explosion', {
          position: [x + offset, y], velocity: [offset, 20],
          colour: colour(), size: offset === 0 ? 5 : 2
        })
        et.fire('enemy_destroyed', 2500)
        et.fire('boss_defeated')
        return
      }
      const nextPhase = energy > maxEnergy * 2 / 3 ? 1 : energy > maxEnergy / 3 ? 2 : 3
      if (phase !== nextPhase) {
        phase = nextPhase
        et.fire('boss_phase', phase)
        et.fire('explosion', {
          position: [x, y], velocity: [0, 0], colour: colour(), size: 1
        })
      }
    },
    fire: ctx => {
      if (age < 3000 || ctx.gameTime - lastFired < [1800, 1350, 950][phase - 1]) return []
      lastFired = ctx.gameTime
      volleys++
      const heading = maths.calculateHeading([x, y], ctx.ship.getPosition())
      const shot = angle => Bullet({
        position: [x, y + 45],
        velocity: [Math.cos(angle) * (160 + phase * 25), Math.sin(angle) * (160 + phase * 25)],
        radius: 6, colour: '#ff805f', damage: 7
      })
      const shots = []
      for (let i = -phase; i <= phase; i++) shots.push(shot(heading + i * 0.16))
      if (phase > 1 && volleys % 3 === 0) {
        const count = phase === 3 ? 16 : 12
        for (let i = 0; i < count; i++) shots.push(shot(i * Math.PI * 2 / count + age / 1600))
      }
      et.fire('boss_shot')
      return shots
    },
    render: ctx => {
      age += ctx.timeSinceLastFrame
      const [pullX, pullY] = gravity.step(ctx.timeSinceLastFrame)
      driftX += pullX
      driftY += pullY
      const entry = Math.min(1, age / 3000)
      x = Math.max(82, Math.min(window.innerWidth - 82,
        window.innerWidth / 2 + Math.sin(age / 1600) * Math.min(280, window.innerWidth * 0.3) * entry + driftX))
      y = -120 + (Math.min(160, window.innerHeight * 0.24) + 120) * entry +
        Math.sin(age / 800) * 12 * entry + driftY
      if (entry === 1) y = Math.max(82, Math.min(window.innerHeight - 82, y))
      const buffer = ctx.buffer
      buffer.save()
      buffer.translate(x, y)
      buffer.shadowColor = colour()
      buffer.shadowBlur = 24
      buffer.strokeStyle = colour()
      buffer.fillStyle = '#241637'
      buffer.lineWidth = 3
      for (const side of [-1, 1]) {
        buffer.beginPath()
        buffer.moveTo(side * 40, -45)
        buffer.lineTo(side * 125, -65 + Math.sin(age / 140) * 12)
        buffer.lineTo(side * 105, 30)
        buffer.lineTo(side * 45, 55)
        buffer.closePath()
        buffer.fill()
        buffer.stroke()
        buffer.beginPath()
        buffer.moveTo(side * 45, 0)
        buffer.lineTo(side * 110, -35)
        buffer.stroke()
      }
      buffer.drawImage(img, -130, -120, 260, 240)
      buffer.shadowBlur = 12
      buffer.rotate(age / 1200)
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3
        buffer.beginPath()
        buffer.arc(Math.cos(angle) * 86, Math.sin(angle) * 86, 4, 0, Math.PI * 2)
        buffer.fillStyle = colour()
        buffer.fill()
      }
      buffer.restore()
    }
  }
  return instance
}
