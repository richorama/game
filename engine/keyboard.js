const et = require('eventthing')

const keyStates = {}

module.exports.keyStates = () => keyStates

const subscribedKeys = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
])

document.addEventListener('keydown', evt => {
  if (!subscribedKeys.has(evt.code)) return
  evt.preventDefault()
  if (keyStates[evt.code]) return
  keyStates[evt.code] = true
  et.fire('keydown', evt.code)
})

document.addEventListener('keyup', evt => {
  if (!subscribedKeys.has(evt.code)) return
  evt.preventDefault()
  keyStates[evt.code] = false
  et.fire('keyup', evt.code)
})