const { test } = require('node:test')
const assert = require('node:assert/strict')
const et = require('eventthing')

test('restart recognises physical R and key-only events without repeating after reset', t => {
  const handlers = {}
  const events = []
  const originalDocument = global.document
  const originalWindow = global.window
  t.after(() => {
    global.document = originalDocument
    global.window = originalWindow
    delete require.cache[require.resolve('../engine/keyboard')]
  })
  global.document = { addEventListener: (name, handler) => { handlers[name] = handler } }
  global.window = { addEventListener: (name, handler) => { handlers[name] = handler } }
  t.mock.method(et, 'fire', (name, value) => events.push({ name, value }))
  const keyboard = require('../engine/keyboard')
  const press = props => handlers.keydown({ preventDefault() {}, ...props })
  const release = props => handlers.keyup({ preventDefault() {}, ...props })
  press({ code: 'KeyR', key: 'r' })
  keyboard.reset()
  press({ code: 'KeyR', key: 'r', repeat: true })
  release({ code: 'KeyR', key: 'r' })
  press({ key: 'R' })
  release({ key: 'R' })
  press({ key: 'r' })
  assert.deepEqual(events.filter(event => event.name === 'keydown').map(event => event.value),
    ['KeyR', 'KeyR', 'KeyR'])
  press({ code: 'Space' })
  assert.equal(keyboard.keyStates().Space, true)
  handlers.blur()
  assert.equal(keyboard.keyStates().Space, false)
  assert.equal(keyboard.keyStates().KeyR, false)
})
