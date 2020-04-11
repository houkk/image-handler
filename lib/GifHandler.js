const execBuffer = require('exec-buffer')
const gifsicle = require('gifsicle')
const isGif = require('is-gif')
const sizeOf = require('image-size')

const BaseHandler = require('./BaseHandler')

class GifHandler extends BaseHandler {
  constructor(_buffer) {
    super(_buffer)
    if (!isGif(this.buffer)) throw new Error('Expected a Gif')
    this.operations = []
  }

  async singleSideScale (sideRule = 'inside', opts) {
    const _opts = sizeOf(this.buffer)
    let side = 'width'
    if (sideRule === 'inside' &&  _opts.width < _opts.height) side = 'height'
    if (sideRule === 'outside' &&  _opts.width > _opts.height) side = 'height'
    this.operations.push(`--resize-${side}`, `${Math.abs(opts[side])}`)
  }

  /**
   * 
   * @param {*} width // 图宽
   * @param {*} height // 图高
   * @param {*} _opts // 目标宽度高度
   * 智能缩放
   * 1. old_width/new_width 和 old_height/new_height 比较
   * 2. 比例大的需要先裁剪一定长度(z)
   * 3. 比如 width 比例较大: (old_width - z)/new_width = old_height/new_height
   * 4. z = old_width - (old_height/new_height) * new_width
   */
  smartCrop(width, height, position, _opts) {

    if (_opts.width/width > _opts.height/height) {
      const needCropWidth = parseInt(_opts.width - (_opts.height/height) * width)
      let leftWidth = 0 // 距 Y 轴距离
      switch(position){
        case 'left':
          break
        case 'right':
          leftWidth = needCropWidth
          break
        default:
          leftWidth = parseInt(needCropWidth / 2)
          break
        }
        this.operations.push('--crop', `${leftWidth},0+${_opts.width - needCropWidth}x${_opts.height}`)
    }
    if (_opts.width/width < _opts.height/height) {
      const needCropHeight = parseInt(_opts.height - (_opts.width/width) * height)
      let topHeight= 0 // 距 X 轴距离
      switch(position){
        case 'top':
          break
        case 'bottom':
          topHeight = needCropHeight
          break
        default:
          topHeight = parseInt(needCropHeight / 2)
          break
        }
        this.operations.push('--crop', `0,${topHeight}+${_opts.width}x${_opts.height - needCropHeight}`)
    }
  }

  async resize (opts) {
    let { width = 0, height = 0, limit = false, fit = 'cover', position = 'center' } = opts
    
    if (this.isShouldRun('--resize') || this.isShouldRun('--scale')) {
      // scale 属于 resize 操作
      // resize 操作, 前者参数, 会被第二个 resize 重写
      await this.run()
    }

    width = Math.abs(width)
    height = Math.abs(height)
    if ((!width && width != 0) || (!height && height != 0) || (width === 0 && height === 0)) return
    if (limit) {
      // 当给出 width 和 height 大于原有尺寸, 不错处理
      const limitOpts = sizeOf(this.buffer)
      if (width > limitOpts.width || height > limitOpts.height) return
    }

    if (width > 0 && height === 0) { this.operations.push('--resize-width',  width); return }
    if (width === 0 && height > 0) { this.operations.push('--resize-height', height); return }

    switch (fit) {
      case 'cover':
        const _opts = sizeOf(this.buffer)
        this.smartCrop(width, height, position, _opts)
        this.operations.push('--resize', `${width}x${height}`)
        break
      case 'fill':
        // 强行缩放
        this.operations.push('--resize', `${width}x${height}`)
        break
      case 'inside':
        // 以长边为基础, 按比例缩放
        await this.singleSideScale('inside', opts)
        break
      case 'outside':
        // 以短边为基础, 按比例缩放
        await this.singleSideScale('outside', opts)
        break
    }
    return
  }

  isShouldRun(_operation) {
    if (!_operation) return false
    for (const operation of this.operations) {
      if (operation.includes(_operation)) return true
    }
    return false
  }

  async crop (opts) {
    if (this.isShouldRun('--resize') || this.isShouldRun('--scale')) {
      // crop 必定在 resize 之前, 所以此处先处理 resize
      // scale 等同 resize
      await this.run()
    }
    let { left = 0, top = 0, width, height } = opts
    if (!(+left >= 0) || !(+top >= 0) || !+width || !+height) return

    const _opts = sizeOf(this.buffer) // 图片原尺寸

    // 裁剪不能大于原图尺寸, ';' 避免将下行当做 function 参数处理
    ; ({ left, top, width, height } = this.reCalculateCrop({ left, top, width, height }, _opts))
    if (width === 0 || height === 0) return

    this.operations.push('--crop', `${+left},${+top}+${+width}x${height}`)
  }

  rotate (opts) {
    let { rotate } = opts
    if (![90, 180, 270].includes(+rotate)) return // just support 90 180 270
    this.operations.push(`--rotate-${+rotate}`)
  }

  async proportion (opts) {
    let { proportion: multiple } = opts
    if (!+multiple > 0) return

    if (this.isShouldRun('--resize') || this.isShouldRun('--scale')) {
      // scale 属于 resize 操作, 会重写参数, 需要先执行
      await this.run()
    }

    const defaultMultiple = process.env.MAX_MULTIPLE || 4
    multiple = multiple > defaultMultiple ? defaultMultiple : multiple
    
    this.operations.push('--scale', `${multiple}`)
    return 
  }

  async toBuffer () {
    if (!this.operations.length) return this.buffer

    this.operations.unshift('--no-warnings', '--no-app-extensions') // ignore warn info
    this.operations.push('--output', execBuffer.output, execBuffer.input) // gifsicle ... --output outputPath example.gif
    
    return await execBuffer({
      input: this.buffer,
      bin: gifsicle,
      args: this.operations
    }).catch(e => {
      e.message = e.stderr || e.message
      throw e
    })
  }

  async run () {
    const _buffer = await this.toBuffer()
    this.buffer = _buffer
    this.operations = []
    return
  }
}

module.exports = GifHandler
