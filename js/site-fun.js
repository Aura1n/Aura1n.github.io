'use strict';

(function () {
  var DATA_URL = '/extras/site.json'
  var dataPromise = null

  function loadData () {
    if (!dataPromise) {
      dataPromise = fetch(DATA_URL, { cache: 'no-cache' })
        .then(function (response) {
          return response.ok ? response.json() : null
        })
        .catch(function () {
          return null
        })
    }
    return dataPromise
  }

  function pick (list) {
    return list[Math.floor(Math.random() * list.length)]
  }

  function pad (number) {
    return String(number).padStart(2, '0')
  }

  function createRoam () {
    if (document.querySelector('.st-roam')) return

    var button = document.createElement('button')
    button.type = 'button'
    button.className = 'st-roam'
    button.title = '随机看一篇文章'
    button.setAttribute('aria-label', '随机看一篇文章')
    button.innerHTML = '<i class="fas fa-dice" aria-hidden="true"></i><span>随便逛逛</span>'

    button.addEventListener('click', function () {
      loadData().then(function (data) {
        if (!data || !data.posts || !data.posts.length) return
        var current = location.pathname.replace(/index\.html$/, '')
        var pool = data.posts.filter(function (post) {
          return post.url !== current
        })
        if (!pool.length) pool = data.posts
        location.href = pick(pool).url
      })
    })

    document.body.appendChild(button)
  }

  function createMemory () {
    if (!/\/Gallery\/(index\.html)?$/i.test(location.pathname)) return
    var container = document.getElementById('article-container')
    if (!container || document.querySelector('.st-memory')) return

    loadData().then(function (data) {
      if (!data || !data.albums || !data.albums.length) return
      if (document.querySelector('.st-memory')) return

      var now = new Date()
      var today = pad(now.getMonth() + 1) + '-' + pad(now.getDate())
      var candidates = []

      data.albums.forEach(function (album) {
        album.images.forEach(function (image) {
          candidates.push({
            album: album,
            image: image,
            isToday: album.date ? album.date.slice(5, 10) === today : false
          })
        })
      })

      if (!candidates.length) return
      var matches = candidates.filter(function (item) { return item.isToday })
      var choice = pick(matches.length ? matches : candidates)
      var isToday = matches.length > 0
      var year = choice.album.date ? choice.album.date.slice(0, 4) : ''

      var card = document.createElement('div')
      card.className = 'st-memory'

      var link = document.createElement('a')
      link.className = 'st-memory-link'
      link.href = choice.album.url

      var img = document.createElement('img')
      img.className = 'st-memory-img'
      img.src = choice.image
      img.alt = choice.album.title
      img.loading = 'lazy'

      var info = document.createElement('div')
      info.className = 'st-memory-info'

      var label = document.createElement('span')
      label.className = 'st-memory-label'
      label.textContent = isToday
        ? '那年今日 · ' + Number(today.slice(0, 2)) + ' 月 ' + Number(today.slice(3)) + ' 日'
        : '旧时光 · 随机一瞥'

      var title = document.createElement('strong')
      title.textContent = choice.album.title + (isToday && year ? ' · ' + year + ' 年' : '')

      var hint = document.createElement('span')
      hint.className = 'st-memory-hint'
      hint.textContent = '点开相册看看 →'

      info.appendChild(label)
      info.appendChild(title)
      info.appendChild(hint)
      link.appendChild(img)
      link.appendChild(info)
      card.appendChild(link)
      container.insertBefore(card, container.firstChild)
    })
  }

  function init () {
    createRoam()
    createMemory()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
