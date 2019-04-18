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
const Storyboard = require('./engine/storyboard')
const level1 = require('./levels/level_1')
const Upgrade = require('./sprites/upgrade')
const Text = require('./sprites/text')
const Health = require('./sprites/health_bar')
const Ascii = require('./sprites/ascii')
const constants = require('./engine/constants')

const starLayer = layers.add(Layer({}))

const backgroundLayer = layers.add(Layer({}))
backgroundLayer.addSprite(Ascii({}))


for (var i = 0; i < 100; i++) {
  const z = Math.random() + 0.5
  starLayer.addSprite(
    Star({
      x: Math.random() * constants.width,
      y: Math.random() * constants.height,
      speed: z * 50,
      colour: `rgb(${(86 * z) / 2}, ${(182 * z) / 2}, ${(194 * z) / 2})`,
      radius: z * 2
    })
  )
}

const ship = Ship({
  x: constants.width * 0.5,
  y: constants.height * 0.7,
  maxSpeed: 100,
  energy: 25
})
const shipLayer = Layer({})
shipLayer.addSprite(ship)
layers.add(shipLayer)

const ballisticsLayer = Layer({})
layers.add(ballisticsLayer)

const enemyBallisticsLayer = Layer({})
et.on('create_upgrade', props =>
  enemyBallisticsLayer.addSprite(new Upgrade(props))
)
layers.add(enemyBallisticsLayer)

const weaponsLayer = Layer({})
weaponsLayer.addSprite(
  SimpleGun({ rate: 200, velocity: [0, -300], offset: [0, -12.5], damage: 10 })
)
layers.add(weaponsLayer)

et.on('upgrade', upgrade => {
  if (upgrade.weapon) {
    weaponsLayer.addSprite(upgrade.weapon)
  }
})

const enemyLayer = Layer({})
layers.add(enemyLayer)

et.on('create_enemy', enemyLayer.addSprite)

const effectsLayer = Layer({})
layers.add(effectsLayer)

et.on('explosion', props => {
  effectsLayer.addSprite(new Explosion(props))
})

et.on('display_text', props => {
  effectsLayer.addSprite(new Text(props))
})

effectsLayer.addSprite(new Health({ width: 300, height: 20, y: 20 }))

const storyboard = Storyboard(level1)

gameLoop(ctx => {
  ctx.ship = ship
  ctx.enemies = enemyLayer.all()

  storyboard.tick(ctx)
  hitDetection.detect(ballisticsLayer, enemyLayer) // when bullets hit an enemy
  hitDetection.detect(shipLayer, enemyLayer) // when the ship hits an enemy
  hitDetection.detect(shipLayer, enemyBallisticsLayer) // when enemy bullets hit the ship
  if (keyboard.keyStates().Space) weaponsLayer.fire(ctx, ballisticsLayer)
  enemyLayer.fire(ctx, enemyBallisticsLayer)
  compositor.compose(
    ctx,
    layers.all()
  )
})
