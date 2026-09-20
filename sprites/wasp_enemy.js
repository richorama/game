const et = require('eventthing')
const Bullet = require('./bullet')
const maths = require('../engine/maths')
const GravityMotion = require('../engine/gravity_motion')

const img = new Image()
img.src = 'svg/noun_potter wasp_720014.svg'

module.exports = props => {
  const { position, phase = 0 } = props
  const [startX, startY] = position
  let x = startX
  let y = startY
  let age = 0
  let lastFired = 0
  let energy = 45
  const gravity = GravityMotion()
  let driftX = 0
  let driftY = 0
  let pathX = x
  let pathY = y

  const instance = {
    accelerate: gravity.accelerate,
    teleport: position => {
      x = position[0]
      y = position[1]
      driftX = x - pathX
      driftY = y - pathY
      gravity.reset()
    },
    getPosition: () => [x, y],
    getExtent: () => ({ x, y, radius: 24 }),
    getDamage: () => 20,
    hit: sprite => {
      if (instance.destroyed) return
      energy -= sprite.getDamage()
      et.fire('explosion', {
        position: [x, y], velocity: [0, 60], colour: '#ffd36a',
        size: energy <= 0 ? 1 : 0.1
      })
      if (energy <= 0) {
        instance.removeFromLayer()
        et.fire('enemy_destroyed', 200)
      }
    },
    fire: ctx => {
      if (age < 1500 || y < 0 || ctx.gameTime - lastFired < 1700) return []
      lastFired = ctx.gameTime
      const heading = maths.calculateHeading([x, y], ctx.ship.getPosition())
      return [-0.12, 0.12].map(angle => Bullet({
        position: [x, y],
        velocity: [Math.cos(heading + angle) * 240, Math.sin(heading + angle) * 240],
        radius: 6, colour: '#ffbc59', damage: 7
      }))
    },
    render: ctx => {
      age += ctx.timeSinceLastFrame
      const [pullX, pullY] = gravity.step(ctx.timeSinceLastFrame)
      driftX += pullX
      driftY += pullY
      const amplitude = Math.min(100, window.innerWidth * 0.15)
      pathX = startX + Math.sin(age / 420 + phase) * amplitude
      pathY = startY + age * 0.07
      x = Math.max(30, Math.min(window.innerWidth - 30, pathX + driftX))
      y = pathY + driftY
      if (y > window.innerHeight + 60) return instance.removeFromLayer()
      const buffer = ctx.buffer
      buffer.save()
      buffer.translate(x, y)
      buffer.rotate(Math.sin(age / 420 + phase) * 0.4 + Math.PI)
      buffer.shadowColor = '#ffd36a'
      buffer.shadowBlur = 18
      buffer.drawImage(img, -38, -38, 76, 76)
      buffer.restore()
    }
  }
  return instance
}
