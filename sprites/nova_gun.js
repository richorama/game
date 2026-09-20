const Bullet = require('./bullet')
const et = require('eventthing')

module.exports = () => {
  let lastFired = -Infinity
  return {
    fire: ctx => {
      if (ctx.gameTime - lastFired < 1400) return []
      lastFired = ctx.gameTime
      const [x, y] = ctx.ship.getPosition()
      et.fire('weapon_fire', { kind: 'rotary', colour: '#a9c5ff', position: [x, y] })
      return Array.from({ length: 12 }, (_, i) => {
        const angle = i * Math.PI / 6 + ctx.gameTime / 1800
        return Bullet({
          position: [x + Math.cos(angle) * 28, y + Math.sin(angle) * 28],
          velocity: [Math.cos(angle) * 360, Math.sin(angle) * 360],
          radius: 7, damage: 9, colour: '#a9c5ff'
        })
      })
    },
    render: () => {}
  }
}
