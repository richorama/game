const drawProjectile = require('./projectile')
const speed = 480
const maths = require('../engine/maths')

module.exports = props => {
  let { position, radius, damage } = props
  let [x, y] = position
  let enemy = null
  let lastEnemyPosition = null
  let timeOnScreen = 0
  let velocity = [0, -speed]

  const calculatePosition = ctx => {
    lastEnemyPosition = enemy.getPosition()
    const desired = maths.calculateTrajectory(
      [x, y],
      lastEnemyPosition,
      speed
    )
    const steering = Math.min(1, ctx.timeSinceLastFrame / 180)
    velocity[0] += (desired[0] - velocity[0]) * steering
    velocity[1] += (desired[1] - velocity[1]) * steering
    x += velocity[0] * ctx.timeSinceLastFrame / 1000
    y += velocity[1] * ctx.timeSinceLastFrame / 1000
  }

  const instance = {
    isProjectile: true,
    accelerate: (ax, ay, dt) => {
      velocity[0] += ax * dt / 1000
      velocity[1] += ay * dt / 1000
    },
    hit: sprite => instance.removeFromLayer(),
    getDamage: () => damage,
    getExtent: () => {
      return {
        x,
        y,
        radius
      }
    },
    render: ctx => {
      if (!enemy || enemy.destroyed){
        enemy = maths.getNearest([x,y], ctx.enemies.all())
        if (!enemy){
          return instance.removeFromLayer()
        }
      }
      timeOnScreen += ctx.timeSinceLastFrame
      if (timeOnScreen > 2400){
        return instance.removeFromLayer()
      }

      calculatePosition(ctx)

      drawProjectile(ctx.buffer, {
        x, y, velocity, radius, colour: '#aaff79', length: 38
      })
    }
  }
  return instance
}
