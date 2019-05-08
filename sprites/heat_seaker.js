const twopi = 2 * Math.PI
const speed = 250
const maths = require('../engine/maths')

module.exports = props => {
  let { position, radius, damage } = props
  let [x, y] = position
  let enemy = null
  let lastEnemyPosition = null
  let timeOnScreen = 0

  const calculatePosition = ctx => {
    lastEnemyPosition = enemy.getPosition()
    const newHeading = maths.calculateTrajectory(
      [x, y],
      lastEnemyPosition,
      speed / ctx.timeSinceLastFrame
    )
    x += newHeading[0]
    y += newHeading[1]
  }

  const instance = {
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
      if (!enemy){
        enemy = maths.getNearest([x,y], ctx.enemies.all())
        if (!enemy){
          return instance.removeFromLayer()
        }
      }
      timeOnScreen += ctx.timeSinceLastFrame
      if (timeOnScreen > 800){
        return instance.removeFromLayer()
      }

      calculatePosition(ctx)

      ctx.buffer.fillStyle = '#FFFFFF'
      ctx.buffer.beginPath()
      ctx.buffer.arc(x, y, damage, 0, twopi)
      ctx.buffer.fill()
    }
  }
  return instance
}
