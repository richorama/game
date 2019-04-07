require('./engine/keyboard')
const GameLoop = require('./engine/game_loop')
const compositor = require('./engine/compositor')
const layers = require('./engine/layers')
const Layer = require('./engine/layer')
const Ship = require('./sprites/ship')
const Star = require('./sprites/star')
// const et = require('eventthing')
const weaponSystem = require('./engine/weapon_system')
const SimpleGun = require('./weapons/simple_gun')
const Level1Enemy = require('./sprites/level1_enemy')

const starLayer = layers
  .add(Layer({}))

for (var i = 0; i < 100; i++) {
  const z = Math.random() + 0.5
  starLayer.addSprite(Star({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    speed: z * 10,
    colour: `rgb(${86 * z / 2}, ${182 * z / 2}, ${194 * z / 2})`,
    radius: z * 2
  }))
}

const ship = Ship({
  x: window.innerWidth / 2,
  y: window.innerHeight / 1.5,
  maxSpeed: 200
})

weaponSystem.add(SimpleGun({ rate: 200, velocity: [0, -300], offset: [0, -12.5] }))

layers
  .add(Layer({}))
  .addSprite(ship)

const ballisticsLayer = Layer({})
layers.add(ballisticsLayer)

const weaponsLayer = Layer({})
layers.add(weaponsLayer)

const enemyLayer = Layer({})
layers.add(enemyLayer)

enemyLayer.addSprite(Level1Enemy({
  position: [100, 100],
  speed: 30,
  radius: 20,
  colour: 'rgb(224, 108, 117)'
}))

GameLoop(ctx => {
  ctx.ship = ship
  weaponSystem.fire(ctx, ballisticsLayer)
  compositor.compose(ctx, layers.all())
})

// et.on('*', (value, name) => console.log(`eventthing fired ${name} => ${value}`))