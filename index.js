require('./engine/keyboard')
const GameLoop = require('./engine/game_loop')
const compositor = require('./engine/compositor')
const layers = require('./engine/layers')
const Layer = require('./engine/layer')
const Ship = require('./sprites/ship')
const et = require('eventthing')

const layer = Layer({})

const ship = Ship({ x: 100, y: 100, maxSpeed: 200 })
layer.addSprite(ship)

layers.add(layer)

GameLoop(ctx => {
  compositor.compose(ctx, layers.all())
})

et.on('*', (value, name) => console.log(`eventthing fired ${name} => ${value}`))