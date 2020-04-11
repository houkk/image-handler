const { imageHandler } = require('..')
const fsp = require('fs-promise')
const path = require('path')


const main = async (inPath, outPath) => {
  let buffer = await fsp.readFile(inPath)
  console.time('handler')
  buffer = await imageHandler(buffer, 
    [
      // { method: 'circle', opts: { x: 100, y: 100, r: 100 } },
      // { method: 'format', opts: { format: 'png' }},
      // { method: 'resize', opts: { width: 100, height: 100 } },
      // { method: 'proportion', opts: { proportion: 2 }},
      { method: 'resize', opts: { width: 300, height: 500, fit: 'inside' } },
      { method: 'rotate', opts: { rotate: 10 } }
    ]
  )
  console.timeEnd('handler')
  await fsp.writeFile(outPath, buffer)
}

console.log('----------')
;(async () => {

  try {
    await main(path.join(__dirname, './vscode-backgrround-1.png'), path.join(__dirname, './vscode-backgrround-1_output.png'))
  } catch (error) {
    console.log('error ===> ', error)
  }
})()

