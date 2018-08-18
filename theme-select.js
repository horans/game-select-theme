/*****************************************************
*  project: game theme select                        *
*  description: inpage functions                     *
*  author: horans@gmail.com                          *
*  url: https://github.com/horans/game-theme-select  *
*  update: 180818                                    *
*****************************************************/
/* global _, Vue, WebFont */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "gst" }] */
/* bus */
var bus = new Vue()

/* font */
WebFont.load({
  google: { families: ['Muli:400,600,700'] },
  timeout: 2000,
  active: function () { bus.$emit('gst.font.ready') },
  inactive: function () { bus.$emit('gst.font.ready') }
})

/* vue */
var gst = new Vue({
  el: '#app',
  data: {
    state: {
      init: false,
      wait: false,
      done: true,
      // stackoverflow.com/questions/326069
      iframe: window.self !== window.top
    },
    game: {
      config: {},
      default: {},
      levels: ['easy', 'normal', 'hard'],
      level: 'normal',
      running: false,
      tutorial: false,
      time: {
        now: 0,
        start: 0,
        end: 0,
        tick: 0
      },
      frames: [],
      covers: [],
      cover: 6,
      current: 0,
      last: {}
    },
    templates: [],
    themes: [],
    api: {
      types: {
        getConfig: {
          path: './asset/config.json',
          type: 'GET',
          internal: true
        },
        getTemplates: {
          path: './asset/templates.json',
          type: 'GET',
          internal: true
        }
      }
    }
  },
  computed: {
    // config json path
    conf: function () {
      var l = window.location.href
      var p = '?config='
      var i = l.indexOf(p)
      return i === -1 ? this.api.types.getConfig.path : l.substr(i + p.length)
    },
    // timer of game
    timer: function () {
      return this.formatTime(this.game.time.now - this.game.time.start)
    },
    // finished at least one round
    again: function () {
      return !_.isEmpty(this.game.last)
    },
    // score
    score: function () {
      return _.filter(this.game.frames, function (o) { return o.answer === o.theme }).length
    },
    // current frame
    frame: function () {
      return (this.game.current < 9 ? '0' : '') + (this.game.current + 1)
    }
  },
  methods: {
    // initialize game for first time
    initGame: function () {
      this.apiAction('getConfig')
      this.$on('gst.config.ready', function () {
        this.apiAction('getTemplates')
      })
      this.$on('gst.templates.ready', function () {
        this.resetGame()
      })
      this.$on('gst.game.ready', function () {
        this.state.init = true
      })
    },
    // reset game for next round
    resetGame: function () {
      var t = this
      var c = this.game.config
      // set limits
      if (c.total > t.templates.length) t.game.config.total = t.templates.length
      if (c.total < 1) t.game.config.total = 1
      if (c.option > Math.round(t.templates.length / 2)) t.game.config.option = Math.round(t.templates.length / 2)
      if (c.option < 2) t.game.config.option = 2
      if (c.tick < 1) t.game.config.tick = 1
      // set frames
      t.game.frames = _.shuffle(t.templates).slice(0, t.game.config.total)
      _.each(t.game.frames, function (o, i) {
        t.game.frames[i].options = _.shuffle(_.concat([t.game.frames[i].theme], _.shuffle(_.filter(t.themes, function (h) { return h !== t.game.frames[i].theme })).slice(0, t.game.config.option - 1)))
        t.$set(t.game.frames[i], 'answer', '')
      })
      // set covers
      t.game.covers = _.shuffle(t.templates).slice(0, t.game.cover)
      // set states
      t.game.running = false
      _.each(t.game.time, function (o, k) {
        t.game.time[k] = 0
      })
      t.game.current = 0
      if (!t.state.init) t.$emit('gst.game.ready')
    },
    // game start
    startGame: function () {
      this.state.submit = false
      this.game.running = true
      this.game.tutorial = true
      this.game.time.start = Date.now()
      this.game.time.now = _.clone(this.game.time.start)
      this.game.time.tick = _.clone(this.game.time.start)
      this.$refs.remain.classList.add('ticking')
    },
    // select theme option
    selectOption: function (theme, index) {
      if (this.game.current <= this.game.config.total - 1) {
        this.game.time.tick = Date.now()
        this.game.frames[this.game.current].answer = theme
        this.game.current++
        this.$refs.remain.classList.remove('ticking')
        if (this.game.current === this.game.config.total) {
          this.endGame()
        } else {
          var t = this
          if (index || index === 0) t.clickEffect(index)
          setTimeout(function () {
            t.$refs.remain.classList.add('ticking')
          }, 100)
        }
      }
    },
    // perform option click visual effect
    clickEffect: function (index) {
      var o = this.$refs['option-' + index][0].classList
      o.remove('clicked')
      setTimeout(function () { o.add('clicked') }, 30)
      setTimeout(function () { o.remove('clicked') }, 150)
    },
    // show game tutorial
    showTutorial: function () {
      this.game.running = true
      var t = this
      var u = {}
      var c = function () {
        _.each(t.game.frames[0].options, function (o, i) {
          u[o] = setTimeout(function () {
            t.clickEffect(i)
          }, i * 700)
        })
      }
      c()
      var s = setInterval(function () {
        if (t.game.tutorial) {
          clearInterval(s)
        } else {
          c()
        }
      }, 2100)
      var n = setInterval(function () {
        if (t.game.tutorial) {
          clearInterval(n)
          _.each(u, function (m, l) {
            clearTimeout(u[l])
          })
        }
      }, 200)
    },
    // end the current round
    endGame: function () {
      this.game.time.end = Date.now()
      this.game.last = {
        level: this.game.level,
        score: this.score,
        total: this.game.config.total,
        time: this.game.time.end - this.game.time.start
      }
      this.notifyParent('end', this.game.last)
      this.game.running = false
      this.resetGame()
    },
    // switch game level
    switchLevel: function (lv) {
      if (_.indexOf(this.game.levels, lv) > -1) {
        this.game.level = lv
        var d = this.game.default
        switch (lv) {
          case 'easy':
            this.game.config.option = d.option - 1
            this.game.config.tick = d.tick + 1
            break
          case 'normal':
            this.game.config.option = d.option + 0
            this.game.config.tick = d.tick + 0
            break
          case 'hard':
            this.game.config.option = d.option + 1
            this.game.config.tick = d.tick - 1
            break
          default: break
        }
        this.resetGame()
        this.startGame()
      }
    },
    // show time with millisecond
    formatTime: function (time) {
      return (time < 10000 ? '0' : '') + (time / 1000).toFixed(3)
    },
    // main action with apis
    apiAction: function (type) {
      var t = this
      var a = t.api.types[type]
      if (a) {
        this.state.wait = true
        this.state.done = false
        this.axios({
          url: a.path,
          method: a.type
        }).then(function (res) {
          var r = res.data
          // after ajax
          switch (type) {
            case 'getConfig':
              t.$set(t.game, 'config', r)
              t.$set(t.game, 'default', _.clone(t.game.config))
              t.$emit('gst.config.ready')
              break
            case 'getTemplates':
              t.$set(t.$data, 'templates', r)
              _.each(t.templates, function (o, i) {
                delete t.templates[i].title
                delete t.templates[i].desc
                t.templates[i].load = false
                setTimeout(function () {
                  t.getImage('cover', o.cover, i)
                }, Math.floor(i / 3) * 50)
              })
              t.$set(t.$data, 'themes', _.uniq(_.map(t.templates, 'theme')))
              break
            default: break
          }
        }).catch(function (err) {
          console.log(err)
        }).then(function () {
          t.state.wait = false
        })
      }
    },
    // get template cover images
    getImage: function (type, link, index) {
      var t = this
      var m = document.createElement('img')
      m.src = link
      m.addEventListener('load', function () {
        if (type === 'cover') {
          t.templates[index].load = true
          if (t.templates.length > 0 && _.filter(t.templates, function (o) { return o.load }).length === t.templates.length) t.$emit('gst.templates.ready')
        }
      }, false)
    },
    // notify parent window if load as iframe
    notifyParent: function (act, data) {
      if (this.state.iframe && act) {
        window.parent.postMessage({
          from: 'gst',
          action: act,
          data: data
        }, '*')
      }
    }
  },
  created: function () {
    this.api.types.getConfig.path = this.conf
    var t = this
    bus.$on('gst.font.ready', function () {
      t.initGame()
    })
  },
  watch: {
    // update timer
    'game.time.now': _.debounce(function () {
      if (this.game.running) {
        this.game.time.now = Date.now()
        if (this.game.time.now - this.game.time.tick - this.game.config.tick * 1000 >= 0) this.selectOption()
      }
    }, 70)
  }
})
