const fileType = require('file-type')

/**
 * params: rule <string> // resize, w_100, h_100/crop, left_0, top_0, w_100, h_100/format, png
 */
const Rule = require('./rule')

exports.imageUrlRuleParse = (rule = []) => {
  const res = []
  if (!rule.length) return res

  for (let _rule of rule) {
    _rule = _rule.split(',')
    const method = _rule.shift()
    if (_rule.length && method && typeof Rule[method] === 'function') {
      const _res = Rule[method](_rule)
      _res && _res.method & res.push(_res)
    }
  }
  return res
}

exports.geneStyle = (style) => {
  if (!style) return []
  const styleArr = style.replace(/(\s|\%20)+/g, '').split(':')
  console.log(styleArr)
  return this.imageUrlRuleParse(styleArr)
}

exports.isImage = (input) => {
  const match = fileType(input)
  const extArr = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'gif', 'svg']
  if (extArr.includes(match.ext)) return match.ext
  return false
}
