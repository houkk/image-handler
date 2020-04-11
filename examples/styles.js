/**
 * resize: w_width, h_height, l_limit(0, 1), f_fit, p_position
 * rotate: 不提供角度时, 为去除 EXIF 方向标签; rotate,90
 */

const styleList = [
  'resize,w_480,h_360,l_1:quality,90:resize,w_640,h_480,f_inside',
  'resize,w_272,h_204,l_1:quality,90',
  'resize,w_640,l_0,f_inside:quality,90',
  'resize,w_800,h_800,l_0,f_outside', // outside 按照短边缩放, 短边 800
  'resize,w_1000,h_1000,l_0,f_outside', // outside 按照短边缩放, 短边 1000
  'resize,w_750,l_1,f_inside:rotate,10:quality,90',
  'format:png',
  'proportion,0.3:crop,l_0,t_0,w_100,h_100',
  'format,png:resize,w_100,h_100:circle,x_50,y_50,r_30'

]

module.exports = styleList
