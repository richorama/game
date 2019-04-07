const et = require('eventthing')

const keyStates = {}

module.exports.keyStates = () => keyStates

const subscribedKeys = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ControlLeft'
])

document.addEventListener('keydown', evt => {
  if (!subscribedKeys.has(evt.code)) return console.log(`unknown key ${evt.code}`)
  evt.preventDefault()
  if (keyStates[evt.code]) return
  keyStates[evt.code] = true
  et.fire('keydown', evt.code)
  et.fire('keychange', keyStates)
})

document.addEventListener('keyup', evt => {
  if (!subscribedKeys.has(evt.code)) return
  evt.preventDefault()
  keyStates[evt.code] = false
  et.fire('keyup', evt.code)
  et.fire('keychange', keyStates)
})