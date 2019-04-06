const GameLoop = require('./engine/game_loop')
const compositor = require('./engine/compositor')
const layers = require('./engine/layers')
const Layer = require('./engine/layer')
const Ship = require('./sprites/ship')

const layer = Layer({})

const ship = Ship({ x: 100, y: 100 })
layer.addSprite(ship)

layers.add(layer)

GameLoop(ctx => {
  compositor.compose(ctx, layers.all())
})
