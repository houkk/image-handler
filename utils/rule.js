const identifier = {
  resize: {
    w: 'width',
    h: 'height',
    f: 'fit', // cover, contain, fill, inside or outside
    l: 'limit', // true: 当大于图片尺寸, 不做处理
    p: 'position', // center left right top bottom ...
  },
  crop: {
    x: 'left',
    y: 'top',
    w: 'width',
    h: 'height'
  },
  circle: {
    x: 'x',
    y: 'y',
    r: 'r'
  }
}

module.exports = {
  resize: (_arr) => {
    const opts = { limit: false }
    _arr.forEach(e => {
      e = e.split('_')
      // 包含多个 _ 或 没有指定标识符不作处理
      if (!e.length || e.length > 2 || !identifier.resize[e[0]]) return
      opts[identifier.resize[e[0]]] = e[1]
    });
    if (!Object.keys(opts).length) return {}
    if (opts.limit && (['0', 'false'].includes(opts.limit))) opts.limit = false
    return {
      method: 'resize',
      opts
    }
  },

  crop: (_arr) => {
    const opts = {}
    _arr.forEach(e => {
      e = e.split('_')
      // 包含多个 _ 或 没有指定标识符不作处理
      if (!e.length || e.length > 2 || !identifier.crop[e[0]]) return
      opts[identifier.crop[e[0]]] = e[1]
    });
    if (!Object.keys(opts).length) return {}
    return {
      method: 'crop',
      opts
    }
  },

  rotate: (_arr) => {
    const res = {
      method: 'rotate',
      opts: {
        rotate: null
      }
    }

    console.log(_arr)
    if (!_arr.length) {
      // 不提供角度, 即认为去除 EXIF Orientation 标记
      return res
    }
    
    if (!+_arr[0]) return {} // 非数字角度不做处理

    res.opts.rotate = parseInt(_arr[0])
    return res
  },

  format: (_arr) => {
    if (!_arr.length) return {}
    return {
      method: 'format',
      opts: {
        format: _arr[0]
      }
    }
  },

  proportion: (_arr) => {
    if (!_arr.length || ! +_arr[0]) return {}
    return {
      method: 'proportion',
      opts: {
        proportion: +_arr[0]
      }
    }
  },

  circle: (_arr) => {
    const opts = { r: 0 }
    _arr.forEach(e => {
      e = e.split('_')
      // 包含多个 _ 或 没有指定标识符不作处理
      if (!e.length || e.length > 2 || !identifier.circle[e[0]]) return
      opts[identifier.circle[e[0]]] = e[1]
    });
    if (!Object.keys(opts).length) return {}

    return {
      method: 'circle',
      opts
    }
  }
}