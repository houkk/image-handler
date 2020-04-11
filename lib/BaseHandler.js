class BaseHandler {
  constructor (_buffer){
    if (!Buffer.isBuffer(_buffer)) {
      throw new Error('Expected a buffer')
    }
    this.buffer = _buffer
  }

  cropLimit (dimension, maximum) {
    return Math.min(Math.max(dimension, 0), maximum)
  }

  reCalculateCrop(dest_opts, source_opts) {
    let { left, top, width, height } = dest_opts
    let { width: source_width, height: source_height } = source_opts
    left = this.cropLimit(left, source_width)
    top = this.cropLimit(top, source_height)
    width = this.cropLimit(width, source_width - left)
    height = this.cropLimit(height, source_height - top)
    return { left, top, width, height }
  }

  resize() { return }

  crop() { return }

  circle() { return }

  quality () { return }

  format () { return }

  rotate() { return }

  proportion() {}

  toBuffer() { return }
}

module.exports = BaseHandler
