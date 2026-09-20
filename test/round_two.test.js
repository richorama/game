const { test } = require('node:test')
const assert = require('node:assert/strict')
const et = require('eventthing')

global.window = { innerWidth: 1280, innerHeight: 900 }
global.Image = class Image {}

const Campaign = require('../engine/campaign')
const Storyboard = require('../engine/storyboard')
const Layer = require('../engine/layer')
const { detect } = require('../engine/hit_detection')
const applyGravity = require('../engine/gravity_field')
const PortalPair = require('../sprites/portal_pair')
const BlackHole = require('../sprites/black_hole')
const Ship = require('../sprites/ship')
const Upgrade = require('../sprites/upgrade')
const Beetle = require('../sprites/beetle_enemy')
const Spider = require('../sprites/spider_enemy')
const Wasp = require('../sprites/wasp_enemy')
const Drone = require('../sprites/drone_enemy')
const Boss = require('../sprites/boss_enemy')
const RiftEnemy = require('../sprites/rift_enemy')
const Bullet = require('../sprites/bullet')
const Beam = require('../sprites/beam')
const HeatSeeker = require('../sprites/heat_seaker')
const BlasterGun = require('../sprites/blaster_gun')
const Hud = require('../sprites/hud')
const weapons = require('../levels/weapons')
const level2 = require('../levels/level_2')

const context = (dt = 16, gameTime = 2000) => ({
  timeSinceLastFrame: dt, gameTime,
  ship: { getPosition: () => [640, 800], isDestroyed: () => false, getShield: () => 0 },
  enemies: Layer({}), weapons: Layer({}),
  buffer: {
    save() {}, restore() {}, translate() {}, rotate() {}, drawImage() {}, beginPath() {},
    closePath() {}, moveTo() {}, lineTo() {}, arc() {}, ellipse() {}, fill() {}, stroke() {},
    fillText() {}, fillRect() {}, createLinearGradient() { return { addColorStop() {} } }
  }
})

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} != ${expected}`)
const position = sprite => [sprite.getExtent().x, sprite.getExtent().y]
const projectileProps = { position: [640, 300], velocity: [0, -200], radius: 6, damage: 5, colour: '#fff' }
const enemyProps = { position: [640, 300], speed: 0, radius: 25, colour: '#ff9266', energy: 100, rate: 2000 }
const factories = {
  player: () => Ship({ x: 640, y: 300, maxSpeed: 360, energy: 100 }),
  pickup: () => Upgrade({ position: [640, 300], speed: 0, radius: 16, colour: '#fff', upgrade: { energy: 25 } }),
  beetle: () => Beetle(enemyProps),
  armouredBeetle: () => Beetle({ ...enemyProps, armoured: true }),
  spider: () => Spider(enemyProps),
  wasp: () => Wasp({ position: [640, 300], phase: 1 }),
  drone: () => Drone({ position: [640, 300] }),
  queen: () => Boss(),
  matriarch: () => Boss({ name: 'RIFT MATRIARCH', maxEnergy: 4200, rift: true }),
  lancer: () => RiftEnemy({ position: [640, 300] }),
  carrier: () => RiftEnemy({ position: [640, 300], carrier: true }),
  bullet: () => Bullet(projectileProps),
  beam: () => Beam(projectileProps),
  missile: () => HeatSeeker(projectileProps)
}

test('campaign waits four seconds, uses round-local timelines and only completes after the second boss', t => {
  const events = []
  t.mock.method(et, 'fire', (name, value) => events.push({ name, value }))
  const ticks = []
  const level = add => {
    add(1000, ctx => ticks.push(ctx.gameTime))
    add(30000, ctx => ticks.push(ctx.gameTime))
  }
  const campaign = Campaign([level, level])
  campaign.tick(context(50, 1000))
  assert.equal(campaign.bossDefeated(), false)
  campaign.bossArrived()
  campaign.tick(context(50, 10000))
  assert.equal(campaign.bossDefeated(), true)
  assert.equal(campaign.bossDefeated(), false)
  assert.equal(campaign.isTransitioning(), true)
  campaign.tick(context(50, 13999))
  assert.equal(campaign.getRound(), 1)
  campaign.tick(context(1, 14000))
  assert.equal(campaign.getRound(), 2)
  assert.equal(campaign.isTransitioning(), false)
  campaign.tick(context(50, 15000))
  assert.deepEqual(ticks, [1000, 1000])
  assert.equal(events.filter(event => event.name === 'level_complete').length, 0)
  campaign.bossArrived()
  assert.equal(campaign.bossDefeated(), true)
  assert.equal(campaign.isComplete(), true)
  assert.equal(campaign.bossDefeated(), false)
  campaign.tick(context(50, 50000))
  assert.deepEqual(ticks, [1000, 1000])
  assert.deepEqual(events.map(event => event.name), ['round_complete', 'round_started', 'level_complete'])
  campaign.reset()
  assert.equal(campaign.getRound(), 1)
  assert.equal(campaign.isComplete(), false)
  campaign.tick(context(50, 1000))
  assert.deepEqual(ticks, [1000, 1000, 1000])
  campaign.bossArrived()
  campaign.bossDefeated()
  campaign.reset()
  campaign.tick(context(50, 5000))
  assert.equal(campaign.getRound(), 1)
  assert.equal(campaign.isTransitioning(), false)
})

test('round two has nine 30-second waves, 127 enemies, staggered unlocks and a portal boss', t => {
  let gameTime = 0
  const events = []
  t.mock.method(et, 'fire', (name, value) => events.push({ name, value, time: gameTime }))
  const storyboard = Storyboard(level2)
  for (; gameTime <= 275000; gameTime += 500) storyboard.tick({ gameTime })
  const waves = events.filter(event => event.name === 'wave')
  assert.deepEqual(waves.map(event => event.time), Array.from({ length: 9 }, (_, i) => 1000 + i * 30000))
  const enemies = events.filter(event => event.name === 'create_enemy')
  assert.equal(enemies.length, 127)
  waves.forEach(wave => {
    const offsets = enemies.filter(event => event.time >= wave.time && event.time < wave.time + 30000)
      .map(event => event.time - wave.time)
    assert.deepEqual([...new Set(offsets)], [0, 6000, 14000, 22000])
  })
  const upgrades = events.filter(event => event.name === 'create_upgrade')
  assert.equal(upgrades.length, 23)
  assert.deepEqual(upgrades.filter(event => event.value.upgrade.weapon)
    .map(event => [event.value.upgrade.name, event.time]), [
    ['Rotary halo', 3000], ['Flank cannons', 33000], ['Heavy pulse', 63000],
    ['Rail lance', 123000], ['Nova pulse', 183000]
  ])
  const boss = enemies.find(event => event.value.isBoss)
  assert.equal(boss.time, 271000)
  assert.equal(boss.value.getName(), 'RIFT MATRIARCH')
  assert.equal(boss.value.getMaxHealth(), 4200)
  assert.equal(events.filter(event => event.name === 'create_portal_pair').length, 10)
  assert.equal(events.filter(event => event.name === 'level_complete').length, 0)
})

for (const [name, create] of Object.entries(factories)) {
  test(`${name} travels through the pair, stays in its layer and is repelled by the exit`, () => {
    const sprite = create()
    const layer = Layer({})
    layer.addSprite(sprite)
    const ctx = context(0)
    ctx.enemies.addSprite({ getPosition: () => [1000, 700] })
    sprite.render(ctx)
    const pair = PortalPair()
    pair.update(context(1500), [])
    const { black, white } = pair.getPositions()
    sprite.teleport(black, [0, -1])
    const health = sprite.getHealth && sprite.getHealth()
    const damage = sprite.getDamage()
    pair.update(ctx, [layer])
    const exit = position(sprite)
    const outward = [exit[0] - white[0], exit[1] - white[1]]
    assert.ok(Math.hypot(...outward) > 24 + sprite.getExtent().radius)
    assert.ok(exit[0] > 0 && exit[0] < window.innerWidth)
    assert.ok(exit[1] > 0 && exit[1] < window.innerHeight)
    assert.equal(sprite.portalCooldownUntil, 3400)
    assert.deepEqual(layer.all(), [sprite])
    assert.equal(sprite.getDamage(), damage)
    if (sprite.getHealth) assert.equal(sprite.getHealth(), health)
    sprite.render(ctx)
    near(position(sprite)[0], exit[0])
    near(position(sprite)[1], exit[1])
    let force
    const accelerate = sprite.accelerate
    sprite.accelerate = (ax, ay, dt) => { force = [ax, ay]; accelerate(ax, ay, dt) }
    applyGravity(context(), [layer], { position: white, radius: 24, range: 300, strength: 2000, repel: true })
    assert.ok(force[0] * outward[0] + force[1] * outward[1] > 0)
    sprite.render(context(16))
    assert.ok(position(sprite).every(Number.isFinite))
  })
}

test('wells orbit opposite one another, telegraph, share transit cooldowns and expire', () => {
  const pair = PortalPair()
  const hazards = Layer({})
  hazards.addSprite(pair)
  const start = pair.getPositions()
  pair.update(context(1499), [])
  const current = pair.getPositions()
  assert.notDeepEqual(current, start)
  near(current.black[0] + current.white[0], window.innerWidth)
  near(current.black[1] + current.white[1], window.innerHeight * 0.86)
  const bullet = Bullet({ ...projectileProps, position: current.black })
  const layer = Layer({})
  layer.addSprite(bullet)
  pair.update(context(0), [layer])
  assert.equal(bullet.portalCooldownUntil, undefined)
  pair.update(context(1, 2001), [layer])
  assert.equal(bullet.portalCooldownUntil, 3401)
  const second = PortalPair({ phase: 2 })
  second.update(context(1500), [])
  bullet.teleport(second.getPositions().black, [1, 0])
  second.update(context(0, 2100), [layer])
  assert.deepEqual(position(bullet), second.getPositions().black)
  second.update(context(0, 3401), [layer])
  assert.notDeepEqual(position(bullet), second.getPositions().black)
  pair.update(context(20500), [])
  assert.equal(hazards.all().length, 0)
})

test('portal exits stay finite and inside a resized narrow viewport', t => {
  const previousWindow = global.window
  t.after(() => { global.window = previousWindow })
  global.window = { innerWidth: 320, innerHeight: 240 }
  const pair = PortalPair()
  pair.update(context(1500), [])
  const sprite = Boss()
  const layer = Layer({})
  layer.addSprite(sprite)
  sprite.teleport(pair.getPositions().black)
  pair.update(context(0), [layer])
  const [x, y] = position(sprite)
  assert.ok(Number.isFinite(x) && Number.isFinite(y))
  assert.ok(x >= 82 && x <= 238 && y >= 82 && y <= 158)
})

test('standalone black holes have stronger attraction and zero-distance white fields remain finite', () => {
  const layer = Layer({})
  let force
  layer.addSprite({
    getExtent: () => ({ x: 500, y: 300, radius: 5 }),
    accelerate: (ax, ay) => { force = [ax, ay] }
  })
  BlackHole({ position: [600, 300] }).update(context(1500), [layer])
  assert.ok(force[0] > 1600 * (1 - 100 / 250))
  near(force[1], 0)
  force = null
  applyGravity(context(), [layer], { position: [500, 300], radius: 24, range: 300, strength: 2000, repel: true })
  assert.equal(force, null)
})

test('transport preserves projectile speed and does not renew missile lifetime', () => {
  for (const factory of [Bullet, Beam]) {
    const sprite = factory(projectileProps)
    sprite.teleport([400, 400], [1, 0])
    sprite.render(context(100))
    near(position(sprite)[0], 420)
    near(position(sprite)[1], 400)
  }
  const missile = HeatSeeker(projectileProps)
  const layer = Layer({})
  layer.addSprite(missile)
  const ctx = context(2300)
  ctx.enemies.addSprite({ getPosition: () => [640, 10000] })
  missile.render(ctx)
  missile.teleport([400, 400], [1, 0])
  ctx.timeSinceLastFrame = 101
  missile.render(ctx)
  assert.equal(layer.all().length, 0)
})

test('teleport severs both beam neighbours and muzzle interpolation without reducing heat', () => {
  const first = Beam(projectileProps)
  const middle = Beam({ ...projectileProps, position: [640, 320], previous: first })
  const last = Beam({ ...projectileProps, position: [640, 340], previous: middle })
  middle.teleport([100, 100], [-1, 0])
  assert.deepEqual([middle.getExtent().endX, middle.getExtent().endY], [100, 100])
  assert.deepEqual([last.getExtent().endX, last.getExtent().endY], [640, 340])
  const ctx = context(24)
  ctx.ship = Ship({ x: 640, y: 800, maxSpeed: 360, energy: 100 })
  const gun = BlasterGun({ rate: 24, velocity: [0, -700], offset: [30, 0], damage: 2 })
  const [shot] = gun.fire(ctx)
  shot.teleport([100, 100], [-1, 0])
  ctx.gameTime += 24
  const [next] = gun.fire(ctx)
  assert.deepEqual([next.getExtent().endX, next.getExtent().endY], position(next))
  ctx.ship.teleport([200, 600])
  ctx.gameTime += 24
  const [afterJump] = gun.fire(ctx)
  assert.deepEqual(position(afterJump), [235, 550])
  assert.deepEqual([afterJump.getExtent().endX, afterJump.getExtent().endY], position(afterJump))
  assert.equal(gun.getHeat(), 6)
})

test('player transport keeps health, shield and engine upgrades and protects arrival; restart clears them', t => {
  const handlers = {}
  t.mock.method(et, 'on', (name, callback) => { handlers[name] = callback })
  const ship = Ship({ x: 640, y: 800, maxSpeed: 360, energy: 100 })
  ship.hit({ getDamage: () => 20 })
  handlers.upgrade({ shield: 40, speedup: 60 })
  ship.accelerate(1000, 1000)
  ship.teleport([400, 400])
  ship.hit({ getDamage: () => 100 })
  assert.equal(ship.getHealth(), 80)
  assert.equal(ship.getShield(), 40)
  handlers.keychange({ ArrowRight: true })
  ship.render(context(100))
  assert.deepEqual(ship.getPosition(), [442, 400])
  handlers.keychange({})
  ship.render(context(800))
  ship.hit({ getDamage: () => 45 })
  assert.equal(ship.getHealth(), 75)
  ship.portalCooldownUntil = 3000
  ship.recreate()
  assert.equal(ship.getHealth(), 100)
  assert.equal(ship.getShield(), 0)
  assert.equal(ship.teleportVersion, 0)
  assert.equal(ship.portalCooldownUntil, 0)
})

test('rail lance pierces four distinct targets without damaging the same target every frame', () => {
  const ctx = context()
  const [shot] = weapons.rail().weapon.fire(ctx)
  assert.equal(shot.getDamage(), 40)
  const bullets = Layer({})
  const enemies = Layer({})
  bullets.addSprite(shot)
  const hits = [0, 0, 0, 0, 0]
  for (let i = 0; i < 3; i++) enemies.addSprite({
    getExtent: shot.getExtent, hit: () => { hits[i]++ }
  })
  detect(bullets, enemies)
  detect(bullets, enemies)
  assert.deepEqual(hits, [1, 1, 1, 0, 0])
  for (let i = 3; i < 5; i++) enemies.addSprite({
    getExtent: shot.getExtent, hit: () => { hits[i]++ }
  })
  detect(bullets, enemies)
  assert.deepEqual(hits, [1, 1, 1, 1, 0])
  assert.equal(bullets.all().length, 0)
})

test('nova pulse fires twelve outward shots and respects its cooldown', () => {
  const ctx = context(100)
  const gun = weapons.nova().weapon
  const shots = gun.fire(ctx)
  assert.equal(shots.length, 12)
  shots.forEach(shot => {
    shot.render(ctx)
    near(Math.hypot(position(shot)[0] - 640, position(shot)[1] - 800), 64)
  })
  assert.deepEqual(gun.fire(ctx), [])
  ctx.gameTime += 1400
  assert.equal(gun.fire(ctx).length, 12)
})

test('carriers release at most three two-drone broods and both rift enemies award score once', t => {
  const events = []
  t.mock.method(et, 'fire', (name, value) => events.push({ name, value }))
  const carrier = RiftEnemy({ position: [640, 200], carrier: true })
  const lancer = RiftEnemy({ position: [640, 200] })
  const layer = Layer({})
  layer.addSprite(carrier)
  layer.addSprite(lancer)
  for (let i = 1; i <= 5; i++) {
    const ctx = context(6000, i * 6000)
    carrier.render(ctx)
    assert.equal(carrier.fire(ctx).length, 3)
  }
  assert.equal(events.filter(event => event.name === 'create_enemy').length, 6)
  for (const sprite of [carrier, lancer]) {
    sprite.hit({ getDamage: () => 300 })
    sprite.hit({ getDamage: () => 300 })
  }
  assert.deepEqual(events.filter(event => event.name === 'enemy_destroyed').map(event => event.value), [400, 250])
})

test('lancers telegraph their dash and keep a straight heading instead of tracking evasions', () => {
  const lancer = RiftEnemy({ position: [640, 200] })
  const ctx = context(2000)
  let warning = false
  ctx.buffer.lineTo = (x, y) => { if (x === 0 && y === 180) warning = true }
  lancer.render(ctx)
  assert.equal(warning, true)
  ctx.timeSinceLastFrame = 400
  lancer.render(ctx)
  const beforeEvasion = position(lancer)
  ctx.ship.getPosition = () => [100, 400]
  ctx.timeSinceLastFrame = 100
  lancer.render(ctx)
  near(position(lancer)[0], beforeEvasion[0])
  near(position(lancer)[1] - beforeEvasion[1], 26)
})

test('HUD carries score and weapons into round two and shows the correct boss name', t => {
  const handlers = {}
  t.mock.method(et, 'on', (name, callback) => { handlers[name] = callback })
  const hud = Hud()
  const text = []
  const ctx = context()
  ctx.buffer.fillText = value => text.push(value)
  handlers.enemy_destroyed(2500)
  handlers.upgrade({ name: 'Beam cannon', weapon: {} })
  handlers.round_complete()
  hud.render(ctx)
  assert.ok(text.includes('ROUND 1 CLEARED'))
  assert.ok(!text.includes('SECTORS CLEARED'))
  text.length = 0
  handlers.round_started({ number: 2 })
  ctx.enemies.addSprite(Boss({ name: 'RIFT MATRIARCH', maxEnergy: 4200 }))
  hud.render(ctx)
  assert.ok(text.includes('SCORE 02500'))
  assert.ok(text.includes('ROUND 2 / 2'))
  assert.ok(text.includes('Blaster  /  Beam cannon'))
  assert.ok(text.includes('RIFT MATRIARCH / PHASE 1'))
  assert.ok(!text.includes('ROUND 1 CLEARED'))
  hud.reset()
  text.length = 0
  hud.render(ctx)
  assert.ok(text.includes('ROUND 1 / 2'))
  assert.ok(text.includes('SCORE 00000'))
  assert.ok(text.includes('Blaster'))
})
