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
const Hud = require('./sprites/hud')
const Audio = require('./engine/audio')
const MuzzleFlash = require('./sprites/muzzle_flash')
const BlackHole = require('./sprites/black_hole')

const audio = Audio(document.getElementById('sound'))
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
let shake = 0
let flash = 0
let flashColour = '#65e8ff'

const starLayer = layers.add(Layer({}))

const backgroundLayer = layers.add(Layer({}))
backgroundLayer.addSprite(Ascii({}))
const hazardLayer = layers.add(Layer({}))
et.on('create_black_hole', props => hazardLayer.addSprite(BlackHole(props)))


for (var i = 0; i < 140; i++) {
  const z = Math.random() + 0.5
  starLayer.addSprite(
    Star({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: z * 50,
      colour: `rgb(${80 * z}, ${Math.min(255, 160 * z)}, ${Math.min(255, 210 * z)})`,
      radius: z * 2
    })
  )
}

const ship = Ship({
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.7,
  maxSpeed: 360,
  energy: 100
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
const addStarterWeapon = () => weaponsLayer.addSprite(
  SimpleGun({ rate: 180, velocity: [0, -650], offset: [0, -30], damage: 12 })
)
addStarterWeapon()
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
  if (props.size >= 1) shake = Math.min(6, Math.max(shake, props.size * 2))
})
et.on('weapon_fire', props => effectsLayer.addSprite(MuzzleFlash(props)))
et.on('ship_hit', () => { shake = 6; flash = 0.16; flashColour = '#ff805f' })
et.on('upgrade', () => { flash = 0.08; flashColour = '#65e8ff' })

et.on('display_text', props => {
  effectsLayer.addSprite(new Text(props))
})

const hudLayer = layers.add(Layer({}))
hudLayer.addSprite(new Health({ width: 300, height: 20, y: 20 }))
const hud = Hud()
hudLayer.addSprite(hud)
const worldLayers = layers.all().filter(layer => layer !== hudLayer)
let restartPending = false
const requestRestart = () => { restartPending = true }
document.getElementById('restart').addEventListener('click', requestRestart)
et.on('keydown', key => {
  if (key === 'KeyR') requestRestart()
  if (key === 'KeyM') audio.toggle()
})

let storyboard = Storyboard(level1)
let runStartedAt = 0
let levelComplete = false
let sectorCleared = false
const gameplayLayers = [ballisticsLayer, enemyBallisticsLayer, weaponsLayer, enemyLayer, effectsLayer, hazardLayer]
const gravityLayers = [shipLayer, enemyLayer, ballisticsLayer, enemyBallisticsLayer]
et.on('level_complete', () => { levelComplete = true })
et.on('boss_defeated', () => {
  enemyLayer.clear()
  enemyBallisticsLayer.clear()
  hazardLayer.clear()
  et.fire('level_complete')
})

gameLoop(ctx => {
  if (restartPending) {
    restartPending = false
    runStartedAt = ctx.gameTime
    gameplayLayers.forEach(layer => layer.clear())
    audio.reset()
    shake = 0
    flash = 0
    keyboard.reset()
    ship.recreate()
    hud.reset()
    addStarterWeapon()
    storyboard = Storyboard(level1)
    levelComplete = false
    sectorCleared = false
  }
  ctx.gameTime -= runStartedAt
  ctx.ship = ship
  ctx.enemies = enemyLayer
  ctx.weapons = weaponsLayer
  hazardLayer.all().forEach(hazard => hazard.update(ctx, gravityLayers))

  if (!ship.isDestroyed() && !sectorCleared) {
    storyboard.tick(ctx)
    hitDetection.detect(ballisticsLayer, enemyLayer) // when bullets hit an enemy
    hitDetection.detect(shipLayer, enemyLayer) // when the ship hits an enemy
    hitDetection.detect(shipLayer, enemyBallisticsLayer) // when enemy bullets hit the ship
    if (!ship.isDestroyed() && keyboard.keyStates().Space) weaponsLayer.fire(ctx, ballisticsLayer)
    if (!ship.isDestroyed()) enemyLayer.fire(ctx, enemyBallisticsLayer)
    if (levelComplete && enemyLayer.all().length === 0) sectorCleared = true
  }
  ctx.buffer.save()
  if (!reducedMotion.matches && shake > 0) {
    ctx.buffer.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)
  }
  compositor.compose(ctx, worldLayers)
  ctx.buffer.restore()
  if (!reducedMotion.matches && flash > 0) {
    ctx.buffer.save()
    ctx.buffer.globalAlpha = flash
    ctx.buffer.fillStyle = flashColour
    ctx.buffer.fillRect(0, 0, window.innerWidth, window.innerHeight)
    ctx.buffer.restore()
  }
  shake = Math.max(0, shake - ctx.timeSinceLastFrame * 0.02)
  flash = Math.max(0, flash - ctx.timeSinceLastFrame / 600)
  hudLayer.render(ctx)
})
