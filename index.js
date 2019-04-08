require('./engine/keyboard')
const GameLoop = require('./engine/game_loop')
const compositor = require('./engine/compositor')
const layers = require('./engine/layers')
const Layer = require('./engine/layer')
const Ship = require('./sprites/ship')
const Star = require('./sprites/star')
const weaponSystem = require('./engine/weapon_system')
const SimpleGun = require('./weapons/simple_gun')
const Level1Enemy = require('./sprites/level1_enemy')
const hitDetection = require('./engine/hit_detection')

const starLayer = layers.add(Layer({}))

for (var i = 0; i < 100; i++) {
  const z = Math.random() + 0.5
  starLayer.addSprite(
    Star({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: z * 50,
      colour: `rgb(${(86 * z) / 2}, ${(182 * z) / 2}, ${(194 * z) / 2})`,
      radius: z * 2
    })
  )
}

const ship = Ship({
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.7,
  maxSpeed: 200,
  energy: 1000
})
const shipLayer = Layer({})
shipLayer.addSprite(ship)
layers.add(shipLayer)

weaponSystem.add(
  SimpleGun({ rate: 200, velocity: [0, -300], offset: [0, -12.5], damage: 10 })
)

const ballisticsLayer = Layer({})
layers.add(ballisticsLayer)

const enemyBallisticsLayer = Layer({})
layers.add(enemyBallisticsLayer)

const weaponsLayer = Layer({})
layers.add(weaponsLayer)

const enemyLayer = Layer({})
layers.add(enemyLayer)

enemyLayer.addSprite(
  Level1Enemy({
    position: [0, 0],
    speed: 30,
    radius: 20,
    colour: 'rgb(224, 108, 117)',
    energy: 30,
    rate: 2000
  })
)

enemyLayer.addSprite(
  Level1Enemy({
    position: [window.innerWidth, 0],
    speed: 30,
    radius: 20,
    colour: 'rgb(224, 108, 117)',
    energy: 30,
    rate: 2000
  })
)

GameLoop(ctx => {
  ctx.ship = ship

  hitDetection.detect(ballisticsLayer, enemyLayer)
  hitDetection.detect(shipLayer, enemyLayer)
  hitDetection.detect(shipLayer, enemyBallisticsLayer)
  weaponSystem.fire(ctx, ballisticsLayer)
  enemyLayer.fire(ctx, enemyBallisticsLayer)
  compositor.compose(
    ctx,
    layers.all()
  )
})

// et.on('*', (value, name) => console.log(`eventthing fired ${name} => ${value}`))
