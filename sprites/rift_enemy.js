const et = require('eventthing')
const Bullet = require('./bullet')
const Drone = require('./drone_enemy')
const maths = require('../engine/maths')
const GravityMotion = require('../engine/gravity_motion')

module.exports = props => {
  const { position, carrier = false } = props
  let [x, y] = position
  let energy = carrier ? 220 : 75
  let age = 0
  let lastFired = 0
  let lastBrood = 0
  let broods = 0
  let dashDirection = null
  const gravity = GravityMotion()
  const colour = carrier ? '#ffa6be' : '#ffb765'
  const instance = {
    accelerate: gravity.accelerate,
    teleport: position => {
      x = position[0]
      y = position[1]
      dashDirection = null
      gravity.reset()
    },
    getPosition: () => [x, y],
    getExtent: () => ({ x, y, radius: carrier ? 38 : 22 }),
    getDamage: () => carrier ? 25 : 18,
    hit: sprite => {
      if (instance.destroyed) return
      energy -= sprite.getDamage()
      et.fire('explosion', {
        position: [x, y], velocity: [0, 25], colour, size: energy <= 0 ? (carrier ? 2 : 1) : 0.1
      })
      if (energy <= 0) {
        instance.removeFromLayer()
        et.fire('enemy_destroyed', carrier ? 400 : 250)
      }
    },
    fire: ctx => {
      if (age < 1800 || y < 0) return []
      if (carrier && broods < 3 && age - lastBrood >= 6000) {
        lastBrood = age
        broods++
        for (const dx of [-26, 26]) et.fire('create_enemy', Drone({ position: [x + dx, y + 35] }))
      }
      if (ctx.gameTime - lastFired < (carrier ? 2400 : 1500)) return []
      lastFired = ctx.gameTime
      const heading = maths.calculateHeading([x, y], ctx.ship.getPosition())
      return (carrier ? [-0.24, 0, 0.24] : [0]).map(offset => Bullet({
        position: [x, y], velocity: [Math.cos(heading + offset) * 250, Math.sin(heading + offset) * 250],
        radius: 6, colour: '#ff9266', damage: 7
      }))
    },
    render: ctx => {
      age += ctx.timeSinceLastFrame
      const dashing = !carrier && age % 3000 > 2300
      const warning = !carrier && age % 3000 > 1800 && !dashing
      const target = carrier ? [x, window.innerHeight * 0.25] : ctx.ship.getPosition()
      const distance = Math.hypot(target[0] - x, target[1] - y)
      if (dashing && !dashDirection) dashDirection = maths.calculateTrajectory([x, y], target, 1)
      if (!dashing) dashDirection = null
      const heading = dashing
        ? dashDirection.map(component => component * 260 * ctx.timeSinceLastFrame / 1000)
        : maths.calculateTrajectory([x, y], target,
          Math.min(distance, (carrier ? 28 : 65) * ctx.timeSinceLastFrame / 1000))
      const pull = gravity.step(ctx.timeSinceLastFrame)
      x += heading[0] + pull[0]
      y += heading[1] + pull[1]
      const buffer = ctx.buffer
      buffer.save()
      buffer.translate(x, y)
      buffer.rotate(carrier ? Math.sin(age / 500) * 0.12 :
        (dashDirection ? Math.atan2(dashDirection[1], dashDirection[0]) : maths.calculateHeading([x, y], target)) - Math.PI / 2)
      buffer.shadowColor = colour
      buffer.shadowBlur = dashing ? 26 : 14
      buffer.strokeStyle = colour
      buffer.fillStyle = '#382d45'
      buffer.lineWidth = 2
      buffer.beginPath()
      if (carrier) {
        buffer.moveTo(-42, -26)
        buffer.lineTo(42, -26)
        buffer.lineTo(48, 20)
        buffer.lineTo(0, 44)
        buffer.lineTo(-48, 20)
      } else {
        buffer.moveTo(0, 34)
        buffer.lineTo(-25, -24)
        buffer.lineTo(0, -9)
        buffer.lineTo(25, -24)
      }
      buffer.closePath()
      buffer.fill()
      buffer.stroke()
      buffer.fillStyle = '#fff0bf'
      buffer.beginPath()
      buffer.arc(0, 0, carrier ? 12 : 6, 0, Math.PI * 2)
      buffer.fill()
      if (warning) {
        buffer.globalAlpha = 0.3 + Math.sin(age / 35) * 0.15
        buffer.beginPath()
        buffer.moveTo(0, 38)
        buffer.lineTo(0, 180)
        buffer.stroke()
      }
      if (carrier) {
        buffer.fillStyle = '#ffa6be'
        for (const dx of [-28, 28]) buffer.fillRect(dx - 6, 4, 12, 18)
      }
      buffer.restore()
    }
  }
  return instance
}
