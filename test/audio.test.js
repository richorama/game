const { test } = require('node:test')
const assert = require('node:assert/strict')
const et = require('eventthing')
const Audio = require('../engine/audio')

const setup = (t, resumeError) => {
  const originalWindow = global.window
  const originalDocument = global.document
  t.after(() => { global.window = originalWindow; global.document = originalDocument })
  const handlers = {}
  const gestures = {}
  const oscillators = []
  const gains = []
  let context
  const parameter = () => ({
    value: 0,
    setValueAtTime(value) { this.value = value },
    linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}
  })
  class FakeAudioContext {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.destination = {}; context = this }
    async resume() {
      if (resumeError) throw resumeError
      this.state = 'running'
    }
    createGain() {
      const gain = { gain: parameter(), connect() {}, disconnect() {} }
      gains.push(gain)
      return gain
    }
    createOscillator() {
      const oscillator = {
        frequency: parameter(), connect() {}, disconnect() {}, start() {},
        stop(time) { if (time === undefined && this.onended) this.onended() }
      }
      oscillators.push(oscillator)
      return oscillator
    }
  }
  global.window = { AudioContext: FakeAudioContext }
  global.document = { addEventListener: (name, handler) => { gestures[name] = handler } }
  t.mock.method(et, 'on', (name, handler) => { handlers[name] = handler })
  const button = {
    textContent: '', title: '', disabled: false,
    setAttribute() {}, addEventListener(name, handler) { this[name] = handler }
  }
  const audio = Audio(button)
  return { audio, button, handlers, gestures, oscillators, gains, context: () => context }
}

test('audio starts on a gesture, throttles fire, caps voices and respects mute across reset', async t => {
  const state = setup(t)
  state.handlers.weapon_fire({ kind: 'pulse' })
  assert.equal(state.oscillators.length, 0)
  state.gestures.keydown({ code: 'Space' })
  await Promise.resolve()
  state.handlers.weapon_fire({ kind: 'beam' })
  state.handlers.weapon_fire({ kind: 'rotary' })
  assert.equal(state.oscillators.length, 0)
  state.handlers.weapon_fire({ kind: 'pulse' })
  state.handlers.weapon_fire({ kind: 'pulse' })
  assert.equal(state.oscillators.length, 1)
  assert.equal(state.oscillators[0].type, 'sine')
  for (let i = 0; i < 40; i++) {
    state.context().currentTime += 0.25
    state.handlers.weapon_fire({ kind: 'pulse' })
  }
  assert.equal(state.oscillators.length, 24)
  state.audio.toggle()
  assert.equal(state.gains[0].gain.value, 0)
  assert.match(state.button.textContent, /off/)
  state.audio.reset()
  state.handlers.upgrade()
  assert.equal(state.oscillators.length, 24)
  state.audio.toggle()
  assert.equal(state.gains[0].gain.value, 0.07)
  state.handlers.upgrade()
  assert.equal(state.oscillators.length, 27)
  state.audio.reset()
  state.handlers.level_complete()
  assert.equal(state.oscillators.length, 31)
})

test('audio startup errors are visible and logged, not swallowed', async t => {
  const error = new Error('audio blocked')
  const logs = []
  t.mock.method(console, 'error', (...args) => logs.push(args))
  const state = setup(t, error)
  state.gestures.pointerdown({})
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(state.button.textContent, 'Sound: retry')
  assert.equal(logs[0][1], error)
})

test('unsupported audio disables the control and warns once', t => {
  const state = setup(t)
  global.window = {}
  const warnings = []
  t.mock.method(console, 'warn', message => warnings.push(message))
  Audio(state.button)
  assert.equal(state.button.disabled, true)
  assert.equal(state.button.textContent, 'Sound unavailable')
  assert.equal(warnings.length, 1)
})
