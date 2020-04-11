const utils = require('./utils')
const GifEngine = require('./lib/GifHandler')
const SharpEngine = require('./lib/SharpHandler')

/**
 * params: buffer <Buffer> image buffer
 * params: rule <array> image rule array
 * params: forceSharp: for gif format
 * returns: <Promise> image buffer
 */
exports.imageHandler = async (buffer, rule, forceSharp) => {
  const isImage = utils.isImage(buffer)
  if (!isImage) throw new Error('Expect buffer of image')
  if (!Array.isArray(rule) || !rule.length) throw new Error('Expected rule array')

  const [ circleArr, otherArr ] = [ [], [] ]
  rule.map(_rule => {
    if (_rule.method === 'circle') {
      circleArr.push(_rule)
      return
    }
    otherArr.push(_rule)
  })

  rule = [].concat(otherArr, circleArr)

  const engine = (isImage !== 'gif' || forceSharp) ? new SharpEngine(buffer) : new GifEngine(buffer)
  
  for (const operation of rule) {
    if (typeof engine[operation.method] === 'function') {
      await engine[operation.method](operation.opts)
    }
  }

  return await engine.toBuffer()
}

/**
 * @param: style <string> 规则字符串
 * @returns: <array> 规则数组
 */
exports.toRule = (ruleStr) => {
  return utils.geneStyle(ruleStr)
}
