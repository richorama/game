const keyboard = require('./engine/keyboard')
const gameLoop = require('./engine/game_loop')
const compositor = require('./engine/compositor')
const layers = require('./engine/layers')
const Layer = require('./engine/layer')
const Ship = require('./sprites/ship')
const Star = require('./sprites/star')
const SimpleGun = require('./sprites/simple_gun')
const hitDetection = require('./engine/hit_detection')
const et = require('eventthing')
const Explosion = require('./sprites/explosion')
const storyboard = require('./engine/storyboard')
const level1 = require('./levels/level1')
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



const ballisticsLayer = Layer({})
layers.add(ballisticsLayer)

const enemyBallisticsLayer = Layer({})
layers.add(enemyBallisticsLayer)

const weaponsLayer = Layer({})
weaponsLayer.addSprite(SimpleGun({ rate: 200, velocity: [0, -300], offset: [0, -12.5], damage: 10 }))
layers.add(weaponsLayer)

const enemyLayer = Layer({})
layers.add(enemyLayer)

et.on('createenemy', enemyLayer.addSprite)

const effectsLayer = Layer({})
layers.add(effectsLayer)

et.on('explosion', props => {
  effectsLayer.addSprite(new Explosion(props))
})

storyboard.play(level1)

gameLoop(ctx => {
  ctx.ship = ship

  hitDetection.detect(ballisticsLayer, enemyLayer) // when bullets hit an enemy
  hitDetection.detect(shipLayer, enemyLayer) // when the ship hits an enemy
  hitDetection.detect(shipLayer, enemyBallisticsLayer) // when enemy bullets hit the ship
  if (keyboard.keyStates().ControlLeft) weaponsLayer.fire(ctx, ballisticsLayer)
  enemyLayer.fire(ctx, enemyBallisticsLayer)
  compositor.compose(
    ctx,
    layers.all()
  )
})
