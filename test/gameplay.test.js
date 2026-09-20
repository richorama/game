const { test } = require('node:test')
const assert = require('node:assert/strict')
const et = require('eventthing')

global.window = { innerWidth: 1280, innerHeight: 900 }
global.Image = class Image {}

const Bullet = require('../sprites/bullet')
const SimpleGun = require('../sprites/simple_gun')
const HeatSeeker = require('../sprites/heat_seaker')
const Beetle = require('../sprites/beetle_enemy')
const Wasp = require('../sprites/wasp_enemy')
const Ship = require('../sprites/ship')
const Upgrade = require('../sprites/upgrade')
const Layer = require('../engine/layer')
const maths = require('../engine/maths')
const { detect } = require('../engine/hit_detection')
const Storyboard = require('../engine/storyboard')
const level = require('../levels/level_1')
const Hud = require('../sprites/hud')
const Beam = require('../sprites/beam')
const BlasterGun = require('../sprites/blaster_gun')
const Boss = require('../sprites/boss_enemy')
const BlackHole = require('../sprites/black_hole')
const RotaryGun = require('../sprites/rotary_gun')
const Drone = require('../sprites/drone_enemy')

const context = (timeSinceLastFrame = 16) => {
  const arcs = []
  const buffer = {
    save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {},
    stroke() {}, fill() {}, fillRect() {}, closePath() {}, ellipse() {}, translate() {}, rotate() {}, drawImage() {},
    fillText() {}, arc(...args) { arcs.push(args) },
    createLinearGradient() { return { addColorStop() {} } }
  }
  return {
    arcs, buffer, timeSinceLastFrame, gameTime: 2000,
    ship: { getPosition: () => [640, 800], getShield: () => 0, isDestroyed: () => false },
    enemies: Layer({}),
    weapons: Layer({})
  }
}

test('bullet speed is identical at 30, 60 and 120 fps', () => {
  for (const fps of [30, 60, 120]) {
    const bullet = Bullet({
      position: [640, 800], velocity: [0, -300], radius: 6, colour: '#65e8ff', damage: 5
    })
    const ctx = context(1000 / fps)
    for (let frame = 0; frame < fps; frame++) bullet.render(ctx)
    assert.ok(Math.abs(bullet.getExtent().y - 500) < 0.001)
  }
})

test('low-damage shots keep a visible body and trail', () => {
  const gun = SimpleGun({ rate: 100, velocity: [0, -650], offset: [0, -30], damage: 1 })
  const ctx = context(0)
  const [bullet] = gun.fire(ctx)
  bullet.render(ctx)
  assert.equal(bullet.getExtent().radius, 6)
  assert.equal(ctx.arcs[0][2], 6)
  assert.equal(ctx.buffer.lineWidth, 12)
  assert.equal(bullet.getDamage(), 1)
  assert.equal(gun.fire(ctx), undefined)
})

test('spread shot diverges symmetrically while twin pulse keeps two parallel barrels', () => {
  const ctx = context(100)
  const spread = SimpleGun({
    rate: 300, velocity: [0, -620], damage: 8,
    barrels: [-0.32, 0, 0.32].map(angle => ({ angle, offset: [0, -30] }))
  }).fire(ctx)
  assert.equal(spread.length, 3)
  spread.forEach(bullet => bullet.render(ctx))
  assert.ok(spread[0].getExtent().x < 640)
  assert.equal(spread[1].getExtent().x, 640)
  assert.ok(spread[2].getExtent().x > 640)
  assert.ok(Math.abs(spread[0].getExtent().x + spread[2].getExtent().x - 1280) < 0.001)
  const twin = SimpleGun({
    rate: 140, velocity: [0, -720], damage: 6,
    barrels: [-22, 22].map(x => ({ angle: 0, offset: [x, -15] }))
  }).fire(ctx)
  twin.forEach(bullet => bullet.render(ctx))
  assert.equal(twin[1].getExtent().x - twin[0].getExtent().x, 44)
  assert.equal(twin[0].getExtent().y, twin[1].getExtent().y)
})

test('nearest target selection compares actual positions', () => {
  const far = { getPosition: () => [900, 900] }
  const near = { getPosition: () => [10, 10] }
  assert.equal(maths.getNearest([0, 0], [far, near]), near)
  assert.equal(maths.getNearest([0, 0], []), undefined)
})

test('missiles retarget destroyed enemies and disappear without targets', () => {
  const ctx = context(100)
  const near = { getPosition: () => [600, 500] }
  const next = { getPosition: () => [900, 500] }
  ctx.enemies.addSprite(near)
  ctx.enemies.addSprite(next)
  const missiles = Layer({})
  const missile = HeatSeeker({ position: [640, 500], radius: 5, damage: 18 })
  missiles.addSprite(missile)
  missile.render(ctx)
  const firstX = missile.getExtent().x
  assert.ok(firstX < 640)
  near.removeFromLayer()
  missile.render(ctx)
  assert.ok(missile.getExtent().x > firstX)
  next.removeFromLayer()
  missile.render(ctx)
  assert.equal(missiles.all().length, 0)
})

test('a consumed bullet cannot damage multiple overlapping enemies', () => {
  const bullets = Layer({})
  const enemies = Layer({})
  bullets.addSprite(Bullet({
    position: [100, 100], velocity: [0, -300], radius: 6, colour: '#fff', damage: 10
  }))
  let hits = 0
  for (let i = 0; i < 2; i++) enemies.addSprite({
    getExtent: () => ({ x: 100, y: 100, radius: 20 }),
    hit: () => { hits++ }
  })
  detect(bullets, enemies)
  assert.equal(hits, 1)
  assert.equal(bullets.all().length, 0)
})

test('armoured beetles fire a fan and award score only once on death', t => {
  const events = []
  t.mock.method(et, 'fire', (name, value) => events.push({ name, value }))
  const enemy = Beetle({
    position: [640, 100], speed: 38, radius: 34, colour: '#d994ff',
    energy: 180, rate: 1800, armoured: true
  })
  const enemies = Layer({})
  enemies.addSprite(enemy)
  assert.equal(enemy.fire(context()).length, 3)
  const hit = { getDamage: () => 100 }
  enemy.hit(hit)
  assert.equal(enemies.all().length, 1)
  enemy.hit(hit)
  enemy.hit(hit)
  assert.equal(enemies.all().length, 0)
  assert.deepEqual(events.filter(event => event.name === 'enemy_destroyed'),
    [{ name: 'enemy_destroyed', value: 250 }])
})

test('wasps weave, shoot pairs and leave the screen cleanly', () => {
  const enemy = Wasp({ position: [640, -50] })
  const enemies = Layer({})
  enemies.addSprite(enemy)
  assert.deepEqual(enemy.fire(context()), [])
  enemy.render(context(1500))
  assert.notEqual(enemy.getPosition()[0], 640)
  assert.equal(enemy.fire(context()).length, 2)
  enemy.render(context(20000))
  assert.equal(enemies.all().length, 0)
})

test('pickups stop in a reachable lane and grant their upgrade once consumed', t => {
  const events = []
  t.mock.method(et, 'fire', (name, value) => events.push({ name, value }))
  const upgrade = { energy: 30, text: '+ REPAIR' }
  const pickup = Upgrade({
    position: [320, -20], speed: 130, radius: 16, colour: '#aaff79', upgrade
  })
  const layer = Layer({})
  layer.addSprite(pickup)
  pickup.render(context(10000))
  assert.ok(Math.abs(pickup.getExtent().x - 320) < 0.001)
  assert.equal(pickup.getExtent().y, 540)
  pickup.render(context(1000))
  assert.ok(Math.abs(pickup.getExtent().x - 320) < 0.001)
  assert.equal(pickup.getExtent().y, 540)
  pickup.hit({})
  assert.equal(layer.all().length, 0)
  assert.equal(events.find(event => event.name === 'upgrade').value, upgrade)
})

test('ship has brief damage protection without making pickups harmful', () => {
  const ship = Ship({ x: 640, y: 800, maxSpeed: 360, energy: 100 })
  ship.hit({ getDamage: () => 0 })
  assert.equal(ship.getHealth(), 100)
  ship.hit({ getDamage: () => 10 })
  ship.hit({ getDamage: () => 10 })
  assert.equal(ship.getHealth(), 90)
  ship.render(context(700))
  ship.hit({ getDamage: () => 10 })
  assert.equal(ship.getHealth(), 80)
})

test('nine 30-second waves have four enemy groups each, then a boss rather than automatic victory', t => {
  const events = []
  let gameTime = 0
  t.mock.method(et, 'fire', (name, value) => events.push({ name, value, time: gameTime }))
  const storyboard = Storyboard(level)
  for (; gameTime <= 275000; gameTime += 500) storyboard.tick({ gameTime })
  const waves = events.filter(event => event.name === 'wave')
  assert.deepEqual(waves.map(event => event.value.number), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  assert.ok(waves.every(event => event.value.total === 9))
  assert.ok(waves.slice(1).every((event, i) => event.time - waves[i].time === 30000))
  const upgrades = events.filter(event => event.name === 'create_upgrade').map(event => event.value.upgrade)
  assert.deepEqual(upgrades.filter(upgrade => upgrade.weapon).map(upgrade => upgrade.name),
    ['Spread shot', 'Twin pulse', 'Beam cannon', 'Heat seeker', 'Rear shot'])
  assert.deepEqual(events.filter(event => event.name === 'create_upgrade' && event.value.upgrade.weapon)
    .map(event => event.time), [3000, 33000, 63000, 123000, 183000])
  assert.equal(upgrades.length, 23)
  assert.equal(upgrades.filter(upgrade => upgrade.energy).length, 12)
  assert.equal(upgrades.filter(upgrade => upgrade.shield).length, 5)
  assert.equal(upgrades.filter(upgrade => upgrade.speedup).length, 2)
  const enemies = events.filter(event => event.name === 'create_enemy')
  assert.equal(enemies.length, 103)
  assert.equal(enemies.filter(event => event.time < waves[1].time).length, 5)
  assert.equal(enemies.filter(event => event.time === waves[0].time).length, 1)
  assert.deepEqual(events.filter(event => event.name === 'boss_arrival').map(event => event.time), [271000])
  waves.forEach(wave => {
    const offsets = enemies.filter(event => event.time >= wave.time && event.time < wave.time + 30000)
      .map(event => event.time - wave.time)
    assert.deepEqual([...new Set(offsets)], [0, 6000, 14000, 22000])
  })
  assert.equal(enemies.filter(event => event.value.isBoss).length, 1)
  assert.equal(events.filter(event => event.name === 'create_black_hole').length, 3)
  assert.equal(events.filter(event => event.name === 'level_complete').length, 0)
})

test('beam segments start at the muzzle, stay thin and form a diagonal as the ship moves', () => {
  const ctx = context(0)
  let x = 400
  ctx.ship.getPosition = () => [x, 800]
  const gun = BlasterGun({ rate: 24, velocity: [0, -700], offset: [30, 0], damage: 2 })
  const [first] = gun.fire(ctx)
  assert.equal(first.getExtent().radius * 2, 12)
  assert.equal(first.getExtent().y, 750)
  assert.equal(first.getExtent().endY, 750)
  first.render(ctx)
  x = 420
  ctx.gameTime += 48
  ctx.timeSinceLastFrame = 48
  const shots = gun.fire(ctx)
  assert.equal(shots.length, 2)
  assert.equal(shots[0].getExtent().x, 445)
  assert.equal(shots[1].getExtent().x, 455)
  assert.ok(shots[0].getExtent().y < shots[1].getExtent().y)
  first.render(ctx)
  assert.equal(first.getExtent().x, 435)
  assert.equal(first.getExtent().endY, first.getExtent().y)
  shots[0].render(ctx)
  assert.deepEqual([shots[0].getExtent().endX, shots[0].getExtent().endY], first.getPosition())
  const strokes = []
  const composites = []
  const lines = []
  ctx.buffer.moveTo = (x, y) => lines.push(['move', x, y])
  ctx.buffer.lineTo = (x, y) => lines.push(['line', x, y])
  ctx.buffer.stroke = () => {
    strokes.push(ctx.buffer.lineWidth)
    composites.push(ctx.buffer.globalCompositeOperation)
  }
  shots[1].render(ctx)
  assert.deepEqual([shots[1].getExtent().endX, shots[1].getExtent().endY], shots[0].getPosition())
  assert.ok(first.getExtent().y < shots[0].getExtent().y)
  assert.ok(shots[0].getExtent().y < shots[1].getExtent().y)
  assert.deepEqual(lines, [
    ['move', ...shots[0].getPosition()], ['line', ...shots[1].getPosition()],
    ['move', ...shots[0].getPosition()], ['line', ...shots[1].getPosition()]
  ])
  assert.equal(strokes[0], 12)
  assert.ok(strokes[1] < 5)
  assert.deepEqual(composites, ['lighter', 'lighter'])
  ctx.gameTime += 5000
  ctx.timeSinceLastFrame = 16
  const resumed = gun.fire(ctx)
  assert.equal(resumed.length, 1)
  assert.equal(resumed[0].getExtent().endX, resumed[0].getExtent().x)
  assert.equal(resumed[0].getExtent().endY, resumed[0].getExtent().y)
})

test('stream emission has the same cadence at 30, 60 and 120 fps', () => {
  for (const fps of [30, 60, 120]) {
    const gun = BlasterGun({ rate: 24, velocity: [0, -700], offset: [30, 0], damage: 2 })
    const ctx = context(1000 / fps)
    let count = 0
    for (let frame = 0; frame <= fps; frame++) {
      ctx.gameTime = frame * 1000 / fps
      count += gun.fire(ctx).length
    }
    assert.equal(count, 42)
  }
})

test('beam collisions follow the diagonal connector, not a vertical stub', () => {
  for (const [x, y, expectedHit] of [
    [120, 480, true], [110, 490, true], [100, 500, true],
    [116, 496, true], [117, 497, false], [100, 480, false], [130, 470, false]
  ]) {
    const beams = Layer({})
    const enemies = Layer({})
    const beam = Beam({
      position: [100, 500], velocity: [0, -220], radius: 6,
      previous: { getPosition: () => [120, 480] }, colour: '#d994ff', damage: 2
    })
    beams.addSprite(beam)
    let hit = false
    enemies.addSprite({
      getExtent: () => ({ x, y, radius: 3 }),
      hit: () => { hit = true }
    })
    detect(beams, enemies)
    assert.equal(hit, expectedHit, `target at ${x}, ${y}`)
  }
})

test('connected beams disappear once both endpoints have left the viewport', () => {
  const beams = Layer({})
  const previous = Beam({
    position: [20, 100], velocity: [-100, 0], radius: 6,
    colour: '#d994ff', damage: 2
  })
  const beam = Beam({
    position: [5, 120], velocity: [-100, 0], radius: 6,
    previous, colour: '#d994ff', damage: 2
  })
  beams.addSprite(previous)
  beams.addSprite(beam)
  beams.render(context(100))
  beams.render(context(100))
  assert.equal(beams.all().length, 2)
  beams.render(context(100))
  assert.equal(beams.all().length, 0)
})

test('destroyed segments break the connector without reconnecting across the gap', () => {
  const beams = Layer({})
  const first = Beam({ position: [100, 100], velocity: [0, -200], radius: 6, colour: '#d994ff', damage: 2 })
  const middle = Beam({
    position: [120, 120], velocity: [0, -200], radius: 6,
    previous: first, colour: '#d994ff', damage: 2
  })
  const last = Beam({
    position: [140, 140], velocity: [0, -200], radius: 6,
    previous: middle, colour: '#d994ff', damage: 2
  })
  const segments = [first, middle, last]
  segments.forEach(segment => beams.addSprite(segment))
  middle.hit({})
  assert.deepEqual(last.getExtent(), { x: 140, y: 140, radius: 6, endX: 140, endY: 140 })
  beams.clear()
  assert.ok(first.destroyed && last.destroyed)
})

test('a gravity well absorbs a connecting line even when both nodes are outside its core', () => {
  const hole = BlackHole({ position: [400, 300] })
  const hazards = Layer({})
  hazards.addSprite(hole)
  const beams = Layer({})
  const first = Beam({ position: [350, 250], velocity: [0, -200], radius: 6, colour: '#d994ff', damage: 2 })
  const last = Beam({
    position: [450, 350], velocity: [0, -200], radius: 6,
    previous: first, colour: '#d994ff', damage: 2
  })
  beams.addSprite(first)
  beams.addSprite(last)
  hole.update(context(1500), [])
  hole.update(context(16), [beams])
  assert.equal(first.destroyed, undefined)
  assert.equal(last.destroyed, true)
})

test('boss has an entrance, three attack phases, contact immunity and one defeat event', t => {
  const events = []
  t.mock.method(et, 'fire', (name, value) => events.push({ name, value }))
  const boss = Boss()
  const enemies = Layer({})
  enemies.addSprite(boss)
  const ctx = context(3000)
  assert.deepEqual(boss.fire(ctx), [])
  boss.render(ctx)
  ctx.gameTime = 3000
  assert.equal(boss.fire(ctx).length, 3)
  boss.hit({ isPlayer: true, getDamage: () => 100000 })
  assert.equal(boss.getHealth(), 2600)
  boss.hit({ getDamage: () => 1000 })
  assert.equal(boss.getPhase(), 2)
  ctx.gameTime = 5000
  assert.equal(boss.fire(ctx).length, 5)
  boss.hit({ getDamage: () => 800 })
  assert.equal(boss.getPhase(), 3)
  ctx.gameTime = 7000
  assert.equal(boss.fire(ctx).length, 23)
  boss.hit({ getDamage: () => 900 })
  boss.hit({ getDamage: () => 900 })
  assert.equal(boss.getHealth(), 0)
  assert.equal(enemies.all().length, 0)
  assert.deepEqual(events.filter(event => event.name === 'boss_phase').map(event => event.value), [2, 3])
  assert.equal(events.filter(event => event.name === 'boss_defeated').length, 1)
  assert.equal(events.filter(event => event.name === 'enemy_destroyed')[0].value, 2500)
})

test('beam overheats after 50 segments, locks out, cools at rest and resumes', () => {
  const gun = BlasterGun({ rate: 24, velocity: [0, -700], offset: [30, 0], damage: 2 })
  const ctx = context(24)
  let count = 0
  for (let frame = 0; frame < 50; frame++) {
    ctx.gameTime = frame * 24
    count += gun.fire(ctx).length
    gun.render(ctx)
  }
  assert.equal(count, 50)
  assert.equal(gun.getHeat(), 100)
  assert.equal(gun.isOverheated(), true)
  ctx.gameTime += 24
  assert.deepEqual(gun.fire(ctx), [])
  for (let frame = 0; frame < 62; frame++) {
    ctx.gameTime += 24
    gun.render(ctx)
  }
  assert.equal(gun.isOverheated(), false)
  assert.ok(gun.getHeat() <= 20)
  const [resumed] = gun.fire(ctx)
  assert.equal(resumed.getExtent().endX, resumed.getExtent().x)
  assert.equal(resumed.getExtent().endY, resumed.getExtent().y)
  ctx.gameTime += 3000
  gun.render(ctx)
  assert.equal(gun.getHeat(), 0)
})

test('beam heat does not cool between stream segments while the trigger is held', () => {
  for (const fps of [30, 60, 120]) {
    const gun = BlasterGun({ rate: 24, velocity: [0, -700], offset: [30, 0], damage: 2 })
    const ctx = context(1000 / fps)
    let segments = 0
    for (let frame = 0; frame < fps * 2; frame++) {
      ctx.gameTime = frame * 1000 / fps
      segments += gun.fire(ctx).length
      gun.render(ctx)
      if (gun.isOverheated()) break
    }
    assert.equal(segments, 50)
    assert.equal(gun.getHeat(), 100)
    assert.ok(ctx.gameTime >= 1176 && ctx.gameTime <= 1210)
  }
})

test('rotary halo fires weak opposing bullets with a changing angle', () => {
  const gun = RotaryGun()
  const ctx = context(0)
  ctx.gameTime = 0
  const first = gun.fire(ctx)
  assert.equal(first.length, 2)
  assert.equal(first[0].getDamage(), 2)
  assert.equal(first[0].getExtent().x, 672)
  assert.equal(first[1].getExtent().x, 608)
  assert.deepEqual(gun.fire(ctx), [])
  ctx.gameTime = 600 * Math.PI / 2
  const rotated = gun.fire(ctx)
  assert.ok(Math.abs(rotated[0].getExtent().x - 640) < 0.001)
  assert.equal(rotated[0].getExtent().y, 832)
  gun.render(ctx)
})

test('gravity wells telegraph and absorb both sides without deleting pickups', () => {
  const hole = BlackHole({ position: [400, 300] })
  const hazards = Layer({})
  hazards.addSprite(hole)
  const friendly = Layer({})
  const hostile = Layer({})
  for (const layer of [friendly, hostile]) layer.addSprite(Bullet({
    position: [400, 300], velocity: [0, 100], radius: 6, damage: 5, colour: '#fff'
  }))
  const pickup = Upgrade({
    position: [400, 300], speed: 0, radius: 16, colour: '#aaff79',
    upgrade: { energy: 25, text: '+ REPAIR' }
  })
  hostile.addSprite(pickup)
  hole.update(context(1499), [friendly, hostile])
  assert.equal(friendly.all().length, 1)
  hole.update(context(1), [friendly, hostile])
  assert.equal(friendly.all().length, 0)
  assert.deepEqual(hostile.all(), [pickup])
  hole.update(context(9500), [friendly, hostile])
  assert.equal(hazards.all().length, 0)
})

test('gravity bends ordinary bullets, beam segments and homing missiles without changing shared gun velocity', () => {
  const velocity = [0, -200]
  const bullets = [
    Bullet({ position: [500, 500], velocity, radius: 6, damage: 5, colour: '#fff' }),
    Beam({ position: [500, 500], velocity, radius: 6, damage: 2, colour: '#d994ff' }),
    HeatSeeker({ position: [500, 500], radius: 5, damage: 18 })
  ]
  const layer = Layer({})
  bullets.forEach(bullet => layer.addSprite(bullet))
  const hole = BlackHole({ position: [620, 500] })
  const hazards = Layer({})
  hazards.addSprite(hole)
  hole.update(context(1500), [])
  hole.update(context(100), [layer])
  const ctx = context(100)
  ctx.enemies.addSprite({ getPosition: () => [500, 0] })
  bullets.forEach(bullet => {
    bullet.render(ctx)
    assert.ok(bullet.getExtent().x > 500)
    assert.ok(Number.isFinite(bullet.getExtent().y))
  })
  assert.deepEqual(velocity, [0, -200])
})

test('spinner drones release radial volleys and award points once', t => {
  const events = []
  t.mock.method(et, 'fire', (name, value) => events.push({ name, value }))
  const drone = Drone({ position: [640, -60] })
  const enemies = Layer({})
  enemies.addSprite(drone)
  const ctx = context(2200)
  ctx.gameTime = 2200
  assert.deepEqual(drone.fire(ctx), [])
  drone.render(ctx)
  assert.equal(drone.fire(ctx).length, 6)
  drone.hit({ getDamage: () => 70 })
  drone.hit({ getDamage: () => 70 })
  assert.equal(enemies.all().length, 0)
  assert.equal(events.filter(event => event.name === 'enemy_destroyed').length, 1)
})

test('shields absorb damage, cap at 100 and reset along with speed and position', t => {
  const handlers = {}
  t.mock.method(et, 'on', (name, handler) => { handlers[name] = handler })
  const ship = Ship({ x: 200, y: 200, maxSpeed: 360, energy: 100 })
  handlers.upgrade({ shield: 150, speedup: 60 })
  assert.equal(ship.getShield(), 100)
  ship.hit({ getDamage: () => 110 })
  assert.equal(ship.getShield(), 0)
  assert.equal(ship.getHealth(), 90)
  ship.render(context(700))
  ship.hit({ getDamage: () => 100 })
  assert.equal(ship.isDestroyed(), true)
  ship.recreate()
  assert.equal(ship.getHealth(), 100)
  assert.equal(ship.getShield(), 0)
  assert.equal(ship.isDestroyed(), false)
  assert.deepEqual(ship.getPosition(), [640, 630])
  handlers.keychange({ ArrowRight: true })
  ship.render(context(100))
  assert.deepEqual(ship.getPosition(), [676, 630])
  ship.hit({ getDamage: () => 5 })
  assert.equal(ship.getHealth(), 95)
})

test('clearing a layer invalidates old targets and accepts fresh sprites', () => {
  const layer = Layer({})
  const old = {}
  layer.addSprite(old)
  layer.clear()
  assert.equal(old.destroyed, true)
  assert.equal(layer.all().length, 0)
  const fresh = {}
  layer.addSprite(fresh)
  old.removeFromLayer()
  assert.deepEqual(layer.all(), [fresh])
})

test('HUD waits for remaining enemies before declaring victory and prioritises death', t => {
  const handlers = {}
  const text = []
  t.mock.method(et, 'on', (name, handler) => { handlers[name] = handler })
  const hud = Hud()
  const ctx = context()
  ctx.buffer.fillRect = () => {}
  ctx.buffer.fillText = value => text.push(value)
  ctx.ship.isDestroyed = () => false
  const enemy = {}
  ctx.enemies.addSprite(enemy)
  handlers.level_complete()
  hud.render(ctx)
  assert.ok(!text.includes('SECTORS CLEARED'))
  enemy.removeFromLayer()
  hud.render(ctx)
  assert.ok(text.includes('SECTORS CLEARED'))
  text.length = 0
  ctx.ship.isDestroyed = () => true
  hud.render(ctx)
  assert.ok(text.includes('SHIP DESTROYED'))
  assert.ok(!text.includes('SECTORS CLEARED'))
  handlers.enemy_destroyed(200)
  handlers.upgrade({ name: 'Beam cannon', weapon: {} })
  hud.reset()
  text.length = 0
  ctx.ship.isDestroyed = () => false
  hud.render(ctx)
  assert.ok(text.includes('SCORE 00000'))
  assert.ok(text.includes('WAVE 1 / 9'))
  assert.ok(text.includes('Blaster'))
  assert.ok(!text.includes('SECTORS CLEARED'))
  assert.ok(!text.includes('SHIP DESTROYED'))
})

test('game loop caps long frame gaps and never supplies a negative delta', t => {
  const previousWindow = global.window
  const previousDocument = global.document
  t.after(() => {
    global.window = previousWindow
    global.document = previousDocument
  })
  let nextFrame
  const frames = []
  const buffer = {
    fillRect() {}, drawImage() {},
    createRadialGradient: () => ({ addColorStop() {} })
  }
  const canvas = { getContext: () => buffer }
  global.document = { getElementById: () => canvas, createElement: () => canvas }
  global.window = {
    ...previousWindow,
    addEventListener() {},
    requestAnimationFrame(callback) { nextFrame = callback }
  }
  t.mock.method(performance, 'now', () => 0)
  require('../engine/game_loop')(ctx => frames.push(ctx))
  nextFrame(16)
  nextFrame(10016)
  nextFrame(10016)
  assert.deepEqual(frames.map(frame => frame.timeSinceLastFrame), [16, 50, 0])
  assert.deepEqual(frames.map(frame => frame.gameTime), [16, 66, 66])
})
