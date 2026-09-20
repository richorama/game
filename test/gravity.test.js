const { test } = require('node:test')
const assert = require('node:assert/strict')
const et = require('eventthing')

global.window = { innerWidth: 1280, innerHeight: 900 }
global.Image = class Image {}

const GravityMotion = require('../engine/gravity_motion')
const Layer = require('../engine/layer')
const BlackHole = require('../sprites/black_hole')
const Ship = require('../sprites/ship')
const Upgrade = require('../sprites/upgrade')
const Beetle = require('../sprites/beetle_enemy')
const Spider = require('../sprites/spider_enemy')
const Wasp = require('../sprites/wasp_enemy')
const Drone = require('../sprites/drone_enemy')
const Boss = require('../sprites/boss_enemy')

const context = (dt = 100) => ({
  gameTime: 4000,
  timeSinceLastFrame: dt,
  ship: { getPosition: () => [640, 800] },
  buffer: {
    save() {}, restore() {}, translate() {}, rotate() {}, drawImage() {}, beginPath() {},
    closePath() {}, moveTo() {}, lineTo() {}, arc() {}, ellipse() {}, fill() {}, stroke() {}, fillText() {}
  }
})

test('gravity drift integrates the same pull at 30, 60 and 120 fps and decays after release', () => {
  const expected = 160 * (1 - (1 - Math.exp(-6)) / 6)
  for (const fps of [30, 60, 120]) {
    const gravity = GravityMotion()
    let x = 0
    let y = 0
    for (let i = 0; i < fps; i++) {
      gravity.accelerate(960, -480)
      const step = gravity.step(1000 / fps)
      x += step[0]
      y += step[1]
    }
    assert.ok(Math.abs(x - expected) < 0.000001)
    assert.ok(Math.abs(y + expected / 2) < 0.000001)
    const firstDrift = gravity.step(100)[0]
    const nextDrift = gravity.step(100)[0]
    assert.ok(firstDrift > nextDrift && nextDrift > 0)
    gravity.reset()
    assert.deepEqual(gravity.step(1000), [0, 0])
  }
})

test('gravity combines forces from multiple wells without retaining old forces', () => {
  const combined = GravityMotion()
  const single = GravityMotion()
  combined.accelerate(100, 200)
  combined.accelerate(200, 100)
  single.accelerate(300, 300)
  assert.deepEqual(combined.step(100), single.step(100))
  assert.deepEqual(combined.step(100), single.step(100))
})

const enemyProps = {
  position: [640, 300], speed: 0, radius: 25, colour: '#ff9266', energy: 100, rate: 2000
}
const factories = {
  player: () => Ship({ x: 640, y: 300, maxSpeed: 360, energy: 100 }),
  pickup: () => Upgrade({
    position: [640, 300], speed: 0, radius: 16, colour: '#aaff79',
    upgrade: { energy: 25, text: '+ REPAIR' }
  }),
  beetle: () => Beetle(enemyProps),
  armouredBeetle: () => Beetle({ ...enemyProps, armoured: true }),
  spider: () => Spider(enemyProps),
  wasp: () => Wasp({ position: [640, 300] }),
  drone: () => Drone({ position: [640, 300] }),
  queen: () => Boss()
}

for (const [name, create] of Object.entries(factories)) {
  test(`${name} is pulled without its movement script snapping it back`, () => {
    const sprite = create()
    const baseline = create()
    const layer = Layer({})
    layer.addSprite(sprite)
    const extent = sprite.getExtent()
    const hole = BlackHole({ position: [extent.x + 100, extent.y] })
    const hazards = Layer({})
    hazards.addSprite(hole)
    hole.update(context(1500), [])
    hole.update(context(), [layer])
    sprite.render(context())
    baseline.render(context())
    const displacement = sprite.getExtent().x - baseline.getExtent().x
    assert.ok(displacement > 1, `${name} did not move towards the well`)
    sprite.render(context())
    baseline.render(context())
    assert.ok(sprite.getExtent().x - baseline.getExtent().x > displacement)
    assert.equal(layer.all().length, 1)
    assert.ok(Number.isFinite(sprite.getExtent().x) && Number.isFinite(sprite.getExtent().y))
  })

  test(`${name} survives the core without division by zero`, () => {
    const sprite = create()
    const layer = Layer({})
    layer.addSprite(sprite)
    const extent = sprite.getExtent()
    const hole = BlackHole({ position: [extent.x, extent.y] })
    hole.update(context(1500), [layer])
    sprite.render(context(16))
    assert.equal(layer.all().length, 1)
    assert.ok(Number.isFinite(sprite.getExtent().x) && Number.isFinite(sprite.getExtent().y))
  })
}

test('the player is pulled while idle but can steer out, and restart clears momentum', t => {
  const handlers = {}
  t.mock.method(et, 'on', (name, handler) => { handlers[name] = handler })
  const ship = Ship({ x: 500, y: 500, maxSpeed: 360, energy: 100 })
  const ships = Layer({})
  ships.addSprite(ship)
  const hole = BlackHole({ position: [600, 500] })
  hole.update(context(1500), [])
  const ctx = context(1000 / 60)
  for (let i = 0; i < 60; i++) {
    hole.update(ctx, [ships])
    ship.render(ctx)
  }
  assert.ok(ship.getPosition()[0] > 550)
  assert.equal(ship.getHealth(), 100)
  assert.equal(ships.all().length, 1)
  handlers.keychange({ ArrowLeft: true })
  for (let i = 0; i < 60; i++) {
    hole.update(ctx, [ships])
    ship.render(ctx)
  }
  assert.ok(ship.getPosition()[0] < 500)
  assert.ok(ship.getPosition()[0] >= 30)
  ship.recreate()
  ship.render(context())
  assert.deepEqual(ship.getPosition(), [640, 630])
})

test('dead players do not accumulate gravity forces', t => {
  const ship = Ship({ x: 500, y: 500, maxSpeed: 360, energy: 100 })
  const ships = Layer({})
  ships.addSprite(ship)
  ship.hit({ getDamage: () => 1000 })
  let pulls = 0
  t.mock.method(ship, 'accelerate', () => { pulls++ })
  const hole = BlackHole({ position: [600, 500] })
  hole.update(context(1500), [ships])
  assert.equal(pulls, 0)
})
