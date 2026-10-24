'use strict';

(function () {
  var keys = document.getElementById('sr-keys')
  if (!keys) return

  var SEMITONES = { do: 0, re: 2, mi: 4, fa: 5, sol: 7, la: 9, si: 11 }
  var NOTES = ['do', 're', 'mi', 'fa', 'sol', 'la', 'si']
  var sequenceEl = document.getElementById('sr-sequence')
  var playBtn = document.getElementById('sr-play')
  var clearBtn = document.getElementById('sr-clear')
  var tempoEl = document.getElementById('sr-tempo')
  var octaveEl = document.getElementById('sr-octave')
  var keyButtons = Array.prototype.slice.call(keys.querySelectorAll('.sr-key'))

  var sequence = []
  var context = null
  var activeOscillators = []
  var timers = []
  var token = 0

  function audio () {
    if (!context) {
      var Ctx = window.AudioContext || window.webkitAudioContext
      context = new Ctx()
    }
    if (context.state === 'suspended') context.resume()
    return context
  }

  function frequency (note, octave) {
    return 261.6256 * Math.pow(2, (SEMITONES[note] + octave) / 12)
  }

  function tone (note, when, duration, octave) {
    var ac = audio()
    var start = ac.currentTime + when
    var osc = ac.createOscillator()
    var gain = ac.createGain()
    var filter = ac.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(frequency(note, octave), start)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2400, start)

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ac.destination)
    osc.start(start)
    osc.stop(start + duration + 0.03)

    activeOscillators.push(osc)
    osc.onended = function () {
      var index = activeOscillators.indexOf(osc)
      if (index > -1) activeOscillators.splice(index, 1)
    }
  }

  function currentOctave () {
    return Number(octaveEl.value) || 0
  }

  function flash (element) {
    element.classList.add('is-playing')
    setTimeout(function () {
      element.classList.remove('is-playing')
    }, 220)
  }

  function keyFor (note) {
    return keyButtons.filter(function (button) {
      return button.dataset.note === note
    })[0]
  }

  function render () {
    if (!sequence.length) {
      sequenceEl.innerHTML = '<span class="sr-empty">点击音键，或直接按数字键 1–7</span>'
      return
    }

    sequenceEl.innerHTML = ''
    sequence.forEach(function (note, index) {
      var chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'sr-chip'
      chip.dataset.index = String(index)
      chip.setAttribute('aria-label', '试听第 ' + (index + 1) + ' 个音：' + note)
      chip.textContent = note
      sequenceEl.appendChild(chip)
    })
    sequenceEl.scrollTop = sequenceEl.scrollHeight
  }

  function clearHighlight () {
    Array.prototype.forEach.call(sequenceEl.querySelectorAll('.sr-chip.is-current'), function (chip) {
      chip.classList.remove('is-current')
    })
    keyButtons.forEach(function (button) {
      button.classList.remove('is-current')
    })
  }

  function highlight (index) {
    clearHighlight()
    var chip = sequenceEl.querySelector('.sr-chip[data-index="' + index + '"]')
    if (chip) chip.classList.add('is-current')
    var button = keyFor(sequence[index])
    if (button) button.classList.add('is-current')
  }

  function add (note) {
    if (sequence.length >= 64) return
    sequence.push(note)
    render()
    tone(note, 0, 0.3, currentOctave())
    flash(keyFor(note))
  }

  function removeLast () {
    if (!sequence.length) return
    sequence.pop()
    render()
  }

  function stop () {
    token += 1
    timers.forEach(clearTimeout)
    timers = []
    activeOscillators.slice().forEach(function (osc) {
      try {
        osc.stop()
      } catch (error) {}
    })
    activeOscillators = []
    clearHighlight()
  }

  function play (event) {
    if (event) event.preventDefault()
    stop()
    if (!sequence.length) return

    var currentToken = token
    var beat = 60 / Number(tempoEl.value)
    var duration = beat * 0.92
    var octave = currentOctave()

    sequence.forEach(function (note, index) {
      tone(note, index * beat, duration, octave)
      timers.push(setTimeout(function () {
        if (currentToken !== token) return
        highlight(index)
      }, index * beat * 1000))
    })

    timers.push(setTimeout(function () {
      if (currentToken === token) clearHighlight()
    }, sequence.length * beat * 1000 + 140))
  }

  keys.addEventListener('click', function (event) {
    var button = event.target.closest('.sr-key')
    if (!button) return
    add(button.dataset.note)
  })

  sequenceEl.addEventListener('click', function (event) {
    var chip = event.target.closest('.sr-chip')
    if (!chip) return
    var note = sequence[Number(chip.dataset.index)]
    if (!note) return
    tone(note, 0, 0.3, currentOctave())
    flash(keyFor(note))
  })

  playBtn.addEventListener('click', play)
  clearBtn.addEventListener('click', function () {
    stop()
    sequence = []
    render()
  })

  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    var tag = event.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    var index = Number(event.key)
    if (index >= 1 && index <= 7) {
      event.preventDefault()
      add(NOTES[index - 1])
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      play()
      return
    }
    if (event.key === 'Backspace') {
      event.preventDefault()
      removeLast()
    }
  })

  render()
})()
