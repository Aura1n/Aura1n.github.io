'use strict';

(function () {
  var RESET_DELAY = 1800

  function fallbackCopy (text) {
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.top = '-9999px'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      try {
        var copied = document.execCommand('copy')
        document.body.removeChild(area)
        copied ? resolve() : reject(new Error('copy failed'))
      } catch (error) {
        document.body.removeChild(area)
        reject(error)
      }
    })
  }

  function copyText (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text)
      })
    }
    return fallbackCopy(text)
  }

  function resetButton (button) {
    button.classList.remove('is-copied', 'is-error')
    if (button._projectCopyLabel) button._projectCopyLabel.textContent = button._projectCopyLabelText
    if (button._projectCopyIcon) button._projectCopyIcon.className = button._projectCopyIconClass
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('.project-code') : null
    if (!button) return

    var code = button.getAttribute('data-project-code') || ''
    if (!code) return

    var label = button.querySelector('.project-code__label')
    var icon = button.querySelector('i')
    if (!button._projectCopyLabel) {
      button._projectCopyLabel = label
      button._projectCopyLabelText = label ? label.textContent : ''
      button._projectCopyIcon = icon
      button._projectCopyIconClass = icon ? icon.className : ''
    }

    if (button._projectCopyTimer) window.clearTimeout(button._projectCopyTimer)

    copyText(code).then(function () {
      button.classList.remove('is-error')
      button.classList.add('is-copied')
      if (label) label.textContent = '已复制'
      if (icon) icon.className = 'fas fa-check'
    }).catch(function () {
      button.classList.remove('is-copied')
      button.classList.add('is-error')
      if (label) label.textContent = '复制失败'
      if (icon) icon.className = 'fas fa-triangle-exclamation'
    }).then(function () {
      button._projectCopyTimer = window.setTimeout(function () {
        resetButton(button)
      }, RESET_DELAY)
    })
  })
})()
