'use strict';

(function () {
  var TRACKS = [
    { name: '小酒馆', artist: '小豆芽', url: '/music/audio/小酒馆.mp3', cover: '/music/img/cover.png' },
    { name: '月光下', artist: '小豆芽', url: '/music/audio/月光下.mp3', cover: '/music/img/cover.png' },
    { name: '管弦氛围', artist: '小豆芽', url: '/music/audio/管弦氛围.mp3', cover: '/music/img/cover.png' },
    { name: '8bit', artist: '小豆芽', url: '/music/audio/8bit.mp3', cover: '/music/img/cover.png' }
  ]

  function init () {
    var el = document.getElementById('works-player')
    if (!el || el.dataset.ready === '1') return
    if (typeof APlayer === 'undefined') {
      setTimeout(init, 120)
      return
    }
    el.dataset.ready = '1'
    new APlayer({
      element: el,
      narrow: false,
      autoplay: false,
      mutex: true,
      theme: '#c06b7c',
      loop: 'all',
      order: 'list',
      preload: 'none',
      listMaxHeight: '360px',
      listFolded: false,
      audio: TRACKS
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
