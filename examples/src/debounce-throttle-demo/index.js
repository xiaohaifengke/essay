/**
 * Created by Jhail on 2019/10/28.
 */
import { debounce, throttle } from './debounce-throttle.custom'
import { debounce as _debounce } from 'lodash'

class Reveal {
  static period = 5 * 1000
  static debounceWait = 200
  static throttleWait = 200
  static itemHeight = 50
  static lineWidth = 1.5
  static xAxisLength = Reveal.period + Math.max(Reveal.debounceWait, Reveal.throttleWait)
  static xAxisHeight = 70
  static categories = [{ type: 'default' }, { type: 'debounce wait=200' }, { type: 'debounce with leading wait=200' }, { type: 'throttle wait=200' }]

  constructor (mousemoveElement, revealElement) {
    if (!mousemoveElement || !revealElement) throw new Error('Parameter error!')
    this.mousemoveElement = document.querySelector(`.${mousemoveElement}`)
    this.revealElement = document.querySelector(`.${revealElement}`)
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.beginTime = 0
    this.color = '#000'

    this.defaultFunc = this.paintRect
    this.debounceFunc = debounce(this.paintRect.bind(this), 150)
    this.debounceLeadingFunc = _debounce(this.paintRect.bind(this), 150, { leading: true })
    this.throttleFunc = throttle(this.paintRect.bind(this), 150)
  }

  walk () {
    window.onload = (e) => {
      const canvasContainerWidth = +this.getStyle(this.mousemoveElement, 'width').replace('px', '')
      const canvasContainerHeight = +this.getStyle(this.revealElement, 'height').replace('px', '')
      this.canvas.width = canvasContainerWidth
      this.canvas.height = canvasContainerHeight
      Reveal.itemHeight = (canvasContainerHeight - Reveal.xAxisHeight) / Reveal.categories.length
      this.msWidth = canvasContainerWidth / Reveal.xAxisLength
      this.revealElement.appendChild(this.canvas)
      this.mousemoveElement.addEventListener('mousemove', this.mousemoveListener.bind(this))
      this.paintAxis()
      this.paintTitle()
    }
  }

  mousemoveListener () {
    const now = Date.now()
    let eventInterval = now - this.beginTime
    if (eventInterval > Reveal.period) {
      this.beginTime = now
      this.reset()
    }
    this.defaultFunc(0)
    this.debounceFunc(1)
    this.debounceLeadingFunc(2)
    this.throttleFunc(3)
  }

  paintRect (index) {
    const padding = 5
    const now = Date.now()
    let processInterval = now - this.beginTime
    const x = processInterval * this.msWidth
    const y = index * Reveal.itemHeight + padding
    this.context.fillStyle = this.color
    this.context.fillRect(x, y, Reveal.lineWidth, Reveal.itemHeight - padding * 2)

    if (index === 1) {
      this.resetColor(false)
    }
  }

  paintAxis () {
    const y = this.canvas.height - Reveal.xAxisHeight / 2
    const arrowX = Math.max(Reveal.debounceWait, Reveal.throttleWait) * this.msWidth / 2
    const arrowY = +(arrowX / 2).toFixed(3)
    this.paintLine({ x: 0, y }, { x: this.canvas.width, y }, 2, '#29eeff')
    this.paintLine({ x: this.canvas.width - arrowX, y: y - arrowY }, { x: this.canvas.width, y }, 2, '#29eeff')
    this.paintLine({ x: this.canvas.width - arrowX, y: y + arrowY }, { x: this.canvas.width, y }, 2, '#29eeff')
    this.paintTick(y)
  }

  paintTick (yXaxis) {
    const tickAmount = Reveal.period / 1000
    const yFrom = yXaxis - 5
    const yTo = yXaxis + 10
    const tickInterval = this.msWidth * 1000
    for (let i = 0; i <= tickAmount; i++) {
      this.paintLine({ x: i * tickInterval, y: yFrom }, { x: i * tickInterval, y: yTo }, 1, '#29eeff')
      this.paintLabel(i + 'S', i * tickInterval + 2, yTo + 20)
    }
  }

  paintLabel (text, x, y) {
    this.context.font = '20px Verdana'
    this.context.fillText(text, x, y)
  }

  paintLine (from, to, width, color) {
    this.context.beginPath()
    this.context.lineWidth = width
    this.context.strokeStyle = color
    this.context.moveTo(from.x, from.y)
    this.context.lineTo(to.x, to.y)
    this.context.stroke()
  }

  paintTitle () {
    for (let i = 0, len = Reveal.categories.length; i <= len; i++) {
      const gradient = this.context.createLinearGradient(0, 0, this.canvas.width, 0)
      gradient.addColorStop('0', '#fff')
      gradient.addColorStop('0.1', '#ff793d')
      gradient.addColorStop('0.2', '#A2FF2A')
      gradient.addColorStop('0.3', '#2aff80')
      gradient.addColorStop('0.4', '#2da5ff')
      gradient.addColorStop('0.5', '#a23cff')
      gradient.addColorStop('0.6', '#3262ff')
      gradient.addColorStop('0.7', '#ff793d')
      gradient.addColorStop('0.8', 'magenta')
      gradient.addColorStop('0.9', '#3262ff')
      gradient.addColorStop('1.0', '#f9ff44')
      this.paintLine({ x: 0, y: i * Reveal.itemHeight }, {
        x: this.canvas.width,
        y: i * Reveal.itemHeight
      }, 2, gradient)

      if (i < len) {
        this.context.font = '30px Verdana'
        this.context.strokeStyle = gradient
        this.context.strokeText(Reveal.categories[i]['type'], 30, i * Reveal.itemHeight + 35)
      }
    }
  }

  reset () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.resetColor(true)
    this.paintAxis()
    this.paintTitle()
  }

  resetColor (immediate) {
    if (immediate) {
      this.color = this.generateColor()
    } else {
      // microtask
      // Promise.resolve().then(() => {
      //   this.color = this.generateColor()
      // })

      // macrotask
      setTimeout(() => {
        this.color = this.generateColor()
      })
    }
  }

  getStyle (el, propName) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(el, null)[propName]
    } else {
      return el.currentStyle[propName]
    }
  }

  generateColor () {
    return `#${c()}${c()}${c()}`

    function c () {
      const n = Math.floor(Math.random() * 256).toString(16)
      return n.length === 2 ? n : '0' + n
    }
  }
}

const r = new Reveal('mousemove-area', 'reveal-area')
r.walk()
