const applyGravity = require('../engine/gravity_field')
const drawWell = require('./well_graphic')

module.exports = props => {
  const { position } = props
  let age = 0

  const instance = {
    update: (ctx, affectedLayers) => {
      age += ctx.timeSinceLastFrame
      if (age >= 11000) return instance.removeFromLayer()
      if (age < 1500) return
      applyGravity(ctx, affectedLayers, { position, radius: 24, range: 280, strength: 2000, absorb: true })
    },
    render: ctx => {
      drawWell(ctx, { position, age, remaining: 11000 - age, label: 'GRAVITY WELL - FIGHT THE PULL' })
    }
  }
  return instance
}
