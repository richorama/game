const HeatSeeker = require('./heat_seaker')
const et = require('eventthing')

module.exports = props => {
  const { rate, offset, damage } = props
  const [dx, dy] = offset

  let lastFired = 0
  return {
    fire: ctx => {
      const elapsedTime = ctx.gameTime - lastFired
      if (elapsedTime >= rate) {
        lastFired = ctx.gameTime
        const [x, y] = ctx.ship.getPosition()
        et.fire('weapon_fire', { kind: 'missile', colour: '#aaff79', position: [x + dx, y + dy] })
        return [
          HeatSeeker({
            position: [x + dx, y + dy],
            radius: 5,
            damage
          })
        ]
      }
    },
    render: () => {}
  }
}
