const Bullet = require('./bullet')
const et = require('eventthing')
const maths = require('../engine/maths')
const GravityMotion = require('../engine/gravity_motion')

const img = new Image()
img.src = 'svg/noun_stag beetle_720017.svg'
const armouredImg = new Image()
armouredImg.src = 'svg/noun_beetle colorado potato_720020.svg'

module.exports = props => {
  let { position, speed, radius, colour, energy, rate, armoured = false, projectileSpeed = 240 } = props
  const maxEnergy = energy
  let [x, y] = position
  let lastFired = 0
  let lastShipPosition = [x, y]
  const gravity = GravityMotion()
  const calculatePosition = ctx => {
    lastShipPosition = ctx.ship.getPosition()
    const newHeading = maths.calculateTrajectory(
      [x, y],
      lastShipPosition,
      speed * ctx.timeSinceLastFrame / 1000
    )
    const [pullX, pullY] = gravity.step(ctx.timeSinceLastFrame)
    x += newHeading[0] + pullX
    y += newHeading[1] + pullY
  }

  const instance = {
    accelerate: gravity.accelerate,
    teleport: position => {
      x = position[0]
      y = position[1]
      gravity.reset()
    },
    hit: sprite => {
      if (instance.destroyed) return
      energy -= sprite.getDamage()
      const explosionHeading = maths.calculateTrajectory(
        [x, y],
        lastShipPosition,
        speed
      )
      if (energy <= 0) {
        et.fire('explosion', {
          position: [x, y],
          velocity: explosionHeading,
          colour,
          size: 1
        })
        instance.removeFromLayer()
        et.fire('enemy_destroyed', armoured ? 250 : 100)
        return
      }
      et.fire('explosion', {
        position: [x, y],
        velocity: explosionHeading,
        colour,
        size: 0.1
      })
    },
    getDamage: () => armoured ? 30 : 15,
    getPosition: () => [x, y],
    getExtent: () => {
      return {
        x,
        y,
        radius
      }
    },
    fire: ctx => {
      if (y < -radius) return []
      const elapsedTime = ctx.gameTime - lastFired
      if (elapsedTime >= rate) {
        lastFired = ctx.gameTime
        const shipPosition = ctx.ship.getPosition()
        const heading = maths.calculateHeading([x, y], shipPosition)
        return (armoured ? [-0.25, 0, 0.25] : [0]).map(angle =>
          Bullet({
            position: [x, y],
            velocity: [Math.cos(heading + angle) * projectileSpeed, Math.sin(heading + angle) * projectileSpeed],
            radius: armoured ? 8 : 6,
            colour: '#ff9266',
            damage: armoured ? 10 : 5
          })
        )
      }
    },
    render: ctx => {
      calculatePosition(ctx)
      const angle =
        maths.calculateHeading([x, y], ctx.ship.getPosition()) + Math.PI * 0.5

      ctx.buffer.save()
      ctx.buffer.translate(x, y)
      ctx.buffer.shadowColor = colour
      ctx.buffer.shadowBlur = 15
      ctx.buffer.strokeStyle = colour
      ctx.buffer.lineWidth = 2
      ctx.buffer.beginPath()
      ctx.buffer.arc(0, 0, radius + 5, 0, Math.PI * 2 * Math.max(0, energy) / maxEnergy)
      ctx.buffer.stroke()
      ctx.buffer.rotate(angle)
      const size = armoured ? 100 : 70
      ctx.buffer.drawImage(armoured ? armouredImg : img, -size / 2, -size / 2, size, size)
      ctx.buffer.restore()
    }
  }
  return instance
}
