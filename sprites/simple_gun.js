const Bullet = require('./bullet')
const et = require('eventthing')

module.exports = props => {
  const {
    rate, velocity, offset, damage, colour = '#65e8ff', radius = 6,
    barrels = [{ angle: 0, offset }]
  } = props

  let lastFired = 0
  return {
    fire: ctx => {
      const elapsedTime = ctx.gameTime - lastFired
      if (elapsedTime >= rate) {
        lastFired = ctx.gameTime
        const [x, y] = ctx.ship.getPosition()
        return barrels.map(barrel => {
          const [dx, dy] = barrel.offset
          const { angle } = barrel
          et.fire('weapon_fire', { kind: 'pulse', colour, position: [x + dx, y + dy] })
          return Bullet({
            position: [x + dx, y + dy],
            velocity: [
              velocity[0] * Math.cos(angle) - velocity[1] * Math.sin(angle),
              velocity[0] * Math.sin(angle) + velocity[1] * Math.cos(angle)
            ],
            radius,
            colour,
            damage
          })
        })
      }
    },
    render: () => {}
  }
}
