const et = require('eventthing')

module.exports = button => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  let context
  let master
  let muted = false
  let resuming = false
  let failed = false
  const voices = new Set()
  const lastPlayed = new Map()

  const updateButton = () => {
    button.textContent = failed ? 'Sound: retry' : muted ? 'Sound: off (M)' : 'Sound: on (M)'
    button.setAttribute('aria-pressed', String(!muted))
    button.title = 'Sound starts after a keypress or click. M toggles sound.'
  }
  const reportError = error => {
    resuming = false
    failed = true
    console.error('Game audio could not start:', error)
    updateButton()
    button.title = 'Audio could not start. Click to retry.'
  }
  const unlock = () => {
    if (!AudioContext || muted || resuming || (context && context.state === 'running')) return
    try {
      if (!context) {
        context = new AudioContext()
        master = context.createGain()
        master.gain.value = 0.07
        master.connect(context.destination)
      }
      resuming = true
      context.resume().then(() => {
        resuming = false
        failed = false
        updateButton()
      }).catch(reportError)
    } catch (error) {
      reportError(error)
    }
  }
  const tone = (start, end, duration, type = 'triangle', delay = 0, volume = 0.3) => {
    if (!context || context.state !== 'running' || muted || voices.size >= 24) return
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const time = context.currentTime + delay
    oscillator.type = type
    oscillator.frequency.setValueAtTime(start, time)
    oscillator.frequency.exponentialRampToValueAtTime(end, time + duration)
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(volume, time + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    oscillator.connect(gain)
    gain.connect(master)
    voices.add(oscillator)
    oscillator.onended = () => {
      oscillator.disconnect()
      gain.disconnect()
      voices.delete(oscillator)
    }
    oscillator.start(time)
    oscillator.stop(time + duration)
  }
  const play = (name, interval, effect) => {
    if (!context || context.state !== 'running' || muted) return
    const now = context.currentTime
    if (lastPlayed.has(name) && now - lastPlayed.get(name) < interval) return
    lastPlayed.set(name, now)
    effect()
  }
  const reset = () => {
    voices.forEach(voice => voice.stop())
    lastPlayed.clear()
  }
  const toggle = () => {
    if (!AudioContext) return
    if (failed) {
      unlock()
      return
    }
    muted = !muted
    if (master) master.gain.value = muted ? 0 : 0.07
    if (muted) reset()
    else unlock()
    updateButton()
  }

  if (!AudioContext) {
    button.textContent = 'Sound unavailable'
    button.disabled = true
    console.warn('Web Audio is not supported by this browser.')
  } else {
    updateButton()
    button.addEventListener('click', toggle)
    const gesture = event => {
      if (event.target === button || event.code === 'KeyM' || /^[mM]$/.test(event.key || '')) return
      unlock()
    }
    document.addEventListener('pointerdown', gesture)
    document.addEventListener('keydown', gesture)
  }

  et.on('weapon_fire', props => {
    if (props.kind === 'beam' || props.kind === 'rotary') return
    play('weapon', 0.22, () => {
      if (props.kind === 'missile') tone(150, 280, 0.12, 'sine', 0, 0.12)
      else tone(480, 260, 0.07, 'sine', 0, 0.09)
    })
  })
  et.on('explosion', props => {
    if (props.size < 1) return
    play('explosion', 0.09, () => {
      tone(90, 30, 0.22, 'triangle', 0, 0.4)
    })
  })
  et.on('upgrade', () => play('upgrade', 0.1, () => {
    const notes = [440, 660, 880]
    notes.forEach((frequency, i) => tone(frequency, frequency * 1.1, 0.13, 'sine', i * 0.07))
  }))
  et.on('wave', () => play('wave', 0.5, () => tone(220, 440, 0.22)))
  et.on('ship_hit', () => play('hit', 0.15, () => tone(150, 60, 0.15, 'triangle')))
  et.on('death', () => play('death', 0.5, () => tone(220, 40, 0.6, 'triangle')))
  et.on('boss_arrival', () => play('boss', 0.5, () => {
    tone(110, 220, 0.5, 'triangle')
    tone(110, 220, 0.5, 'triangle', 0.6)
  }))
  et.on('boss_phase', () => play('phase', 0.5, () => tone(140, 420, 0.3, 'triangle')))
  et.on('boss_shot', () => play('boss-shot', 0.5, () => tone(120, 60, 0.12, 'sine', 0, 0.12)))
  et.on('level_complete', () => play('victory', 1, () => {
    const notes = [330, 440, 550, 660]
    notes.forEach((frequency, i) => tone(frequency, frequency, 0.35, 'triangle', i * 0.14))
  }))

  return { toggle, reset }
}
