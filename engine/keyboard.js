const et = require('eventthing')

const keyStates = {}

module.exports.keyStates = () => keyStates
module.exports.reset = () => {
  Object.keys(keyStates).forEach(key => { keyStates[key] = false })
  et.fire('keychange', keyStates)
}

const keyCode = evt => {
  if (evt.code === 'KeyR' || /^[rR]$/.test(evt.key || '')) return 'KeyR'
  if (evt.code === 'KeyM' || /^[mM]$/.test(evt.key || '')) return 'KeyM'
  return evt.code || evt.key
}

const subscribedKeys = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ControlLeft',
  'Space',
  'KeyR',
  'KeyM'
])

document.addEventListener('keydown', evt => {
  const code = keyCode(evt)
  if (!subscribedKeys.has(code)) return
  evt.preventDefault()
  if (evt.repeat || keyStates[code]) return
  keyStates[code] = true
  et.fire('keydown', code)
  et.fire('keychange', keyStates)
})

window.addEventListener('blur', module.exports.reset)

document.addEventListener('keyup', evt => {
  const code = keyCode(evt)
  if (!subscribedKeys.has(code)) return
  evt.preventDefault()
  keyStates[code] = false
  et.fire('keyup', code)
  et.fire('keychange', keyStates)
})