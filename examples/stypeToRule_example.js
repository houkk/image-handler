const { toRule } = require('../index')
const stypeList = require('./styles')

const main = (index) => {
  const style = stypeList[index]
  console.log(style)
  return toRule(style)
}
console.log(main(11))