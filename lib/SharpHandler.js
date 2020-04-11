const sharp = require('sharp')
const BaseHandler = require('./BaseHandler')

class SharpHandler extends BaseHandler {
  constructor(_buffer) {
    super(_buffer)
    this.sharp = sharp(this.buffer)
  }

  resize (opts) {
    let { width, height, fit, limit, position } = opts
    const resize = Object.assign({}, {
      withoutEnlargement: limit ? true : false
    }, 
      +width ? { width: +width } : {},
      +height ? { height: +height } : {},
      fit ? { fit } : {},
      position ? { position }: {}
    )
    this.sharp.resize(resize)
  }

  async crop (opts) {
    let { left = 0, top = 0, width, height } = opts
    if (!(+left >= 0) || !(+top >= 0) || !+width || !+height) return
    let crop = {
      width: +width, height: +height, left: +left, top: +top
    }
    const _buffer = await this.toBuffer()
    await sharp(_buffer).metadata()
    .then (info => {
      crop = this.reCalculateCrop(crop, { width: info.width, height: info.height })
      this.sharp = sharp(_buffer).extract(crop)
    }).catch(e => {
      console.log('SharpHandler crop error: ', e)
      this.sharp = sharp(_buffer)
    })
  }

  // overlayWith
  async circle (opts) {
    Object.keys(opts).map(_key => opts[_key] = (+opts[_key]) ? Math.abs(opts[_key]) : 0)
    let { x, y, r } = opts
    if (!r) return
    const _buffer = await this.toBuffer()
    await sharp(_buffer).metadata()
    .then (info => {
      const { width: originWidth, height: originHeight } = info
      if (!x && x !== 0) x = Math.round(originWidth / 2)
      if (!y && y !== 0) y = Math.round(originHeight / 2)
      r = + (2 * r > Math.min(originWidth, originHeight) ? Math.min(originWidth, originHeight) / 2 : r).toFixed(2) // 不可超出范围

      const circleSvg = new Buffer(
        `<svg width="${Math.min(x + r, originWidth)}"
              height="${Math.min(y + r, originHeight)}"
        >
          <circle r="${r}" cx="${x}" cy="${y}"/>
        </svg>`
      )
      // overlayWith 默认在链式最后执行; 为了进行上述计算, 将 circle 放在最后执行
      this.sharp = sharp(_buffer).overlayWith(circleSvg, { gravity: 'northwest', cutout: true })
    }).catch(e => {
      console.log('SharpHandler circle error: ', e)
      this.sharp = sharp(_buffer)
    })
  }

  rotate (opts) {
    let { rotate } = opts
    if (rotate === null || rotate === undefined) {
      // 去除 EXIF Orientation 标签
      this.sharp.rotate()
      return 
    }
    if (!+rotate) return
    this.sharp.rotate(+rotate)
  }

  quality (opts) {
    let { quality } = opts
    if (!quality) return
    quality = +quality
    switch (this.key.split('.').pop().toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        this.sharp.jpeg({
          quality
        })
        break
      case 'png':
        this.sharp.png({
          quality
        })
        break
      case 'webp':
        this.sharp.webp({
          quality
        })
        break
    }
  }

  async proportion (opts) {
    const { proportion: multiple } = opts

    if (multiple < 0 || !(+ multiple)) return this

    const buffer = await this.sharp.toBuffer()

    await sharp(buffer).metadata()
    .then(info => {
      this.sharp = sharp(buffer).resize({
        width: Math.round(info.width * multiple),
        height: Math.round(info.height * multiple)
      })
    }).catch(e => {
      console.log('SharpHandler proportion error: ', e)
      this.sharp = sharp(buffer)
    })
  }

  async toBuffer () {
    return await this.sharp.toBuffer()
  }

  format (opts) {
    const { format } = opts
    if (!format || !['jpeg', 'jpg', 'webp', 'png', 'tiff'].includes(format)) return 
    this.sharp.toFormat(format || null)
  }
}

module.exports = SharpHandler