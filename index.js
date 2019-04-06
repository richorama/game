require('./engine/keyboard')
const GameLoop = require('./engine/game_loop')
const compositor = require('./engine/compositor')
const layers = require('./engine/layers')
const Layer = require('./engine/layer')
const Ship = require('./sprites/ship')
const Star = require('./sprites/star')
const et = require('eventthing')

const starLayer = layers
  .add(Layer({}))

for (var i = 0; i < 100; i++){
  const z = Math.random() + 0.5
  starLayer.addSprite(Star({
    x: Math.random() *  window.innerWidth,
    y : Math.random() * window.innerHeight,
    speed : z * 10,
    colour: `rgb(${32 * z}, ${32 * z}, ${32 * z})`,
    radius: z * 2
  }))
}

layers
  .add(Layer({}))
  .addSprite(Ship({
    x: 100, 
    y: 100, 
    maxSpeed: 200
}))


GameLoop(ctx => {
  compositor.compose(ctx, layers.all())
})

et.on('*', (value, name) => console.log(`eventthing fired ${name} => ${value}`))