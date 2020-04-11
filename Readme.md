支持 `jpg`, `jpeg`, `png`, `webp`, `tiff`, `gif`, `svg` 样式的图片裁剪、缩放等操作

---
## 内置处理引擎
* sharp: [点击跳转](https://sharp.pixelplumbing.com/en/stable/api-resize/#resize)
  * 注意: sharp.js 编译安装和运行的 node 版本必须一致
  * install: [点击跳转](https://github.com/lovell/sharp/blob/master/docs/install.md#custom-prebuilt-binaries)
  * sharp-libvips: [点击跳转](https://github.com/lovell/sharp-libvips/releases/)
* gifsicle: [点击跳转](http://www.lcdf.org/gifsicle/man.html)

---
## 图片处理支持类型

* `resize`: 缩放
  * `width`: 宽度
  * `height`: 高度
  * `fit`: 图片缩放规则 `default: cover`
    * `cover`: 智能裁剪
      * 智能裁剪 (个人理解)
      * 1. width 对比 (old_width/new_width) 和 height 对比 (old_height/new_height) 比较
      * 2. 比例大的需要先裁剪一定长度(z)
      * 3. 比如 width 比例较大: (old_width - z)/new_width = old_height/new_height
      * 4. z = old_width - (old_height/new_height) * new_width
    * `fill`: 忽略比例, 强行缩放
    * `inside`: 忽略给定短边, 按照长边比例进行缩放
    * `outside`: 忽略给定长边, 按照短边比例进行缩放
    * `contain`: 图片缩放和 inside 相同, 差别在于是内嵌在给定长宽内
  * `limit`: \<bool\> 当超出原有大小时, 是否禁止缩放; `default: false`
  * `position`: 智能裁剪时保留哪个部位; `center`, `top`, `bottom`, `left`, `right` 

* `crop`: 裁剪
  * `left`: x 坐标
  * `top`: y 坐标
  * `width`: 宽度
  * `height`: 高度
* `rotate`: 翻转
  * `rotate`: 度数
* `quality`: 
  * `quality`: number
* `proportion`:
  * `proportion`: number (放大倍数)
* `format`:
  * `format`: 'png', 'jpg' ...
* `circle`: 裁圆; gif 需先 format png
  * desc: 目前只做了圆处理, 后期会加入花式处理
  * `x`: x 坐标
  * `y`: y 坐标
  * `r`: 半径

---
## 暴露函数

### imageHandler (input, rule, forceSharp)

* input: 仅持支 buffer, 后期优化
* rule:
  ```
  [
    { method: 'format', opts: { format: 'png' } },
    { method: 'resize', opts: { width: 100, height: 100 } }
  ]
  ```
* style: 内置的几种样式, 优先级高于 rule
* forceSharp: 如 format、circle 等功能对 gif 图片而言就需要强制使用 sharp 引擎处理; 因为另一个没写 😂
* return: buffer

### toRule (ruleStr)

* param: ruleStr, 字符串形式处理规则
* returns: ruleArr, 数组形式规则

> 为方便使用, 提供了另一套字符串规则, 使用缩写代替

上文中提到, 支持 `resize` `crop` `circle` `rotate` `format` `proportion` `quality` 七种操作方式， <br>
其中 `resize` `crop` `circle` 三种操作, 需要批量参数修正, 所以制定如下简易规则: <br>


* resize:
  * 示例: `resize,w_100,h_100,f_inside,l_1,p_center`
  * width: w
  * height: h
  * limit: l
  * fit: f
  * position: p
* crop:
  * 示例: `crop,x_100,y_100,w_100,h_100`
  * left: x
  * top: y
  * width: w
  * heigth: h
* circle
  * 示例: `circle,x_100,y_100,r_100`
* rotate
  * 示例: `rotate,10`
* quality
  * 示例: `quality,90`
* proportion
  * 示例: `proportion,2`
* format
  * 示例: `format,png`

单样式字符串, 比如 'format,png' 交由 `toRule` 函数处理, 返回规则数组, 然后交由 `imageHandler` 函数处理即可 <br>
多样式字符串, 样式之间以 `:` 间隔, `resize,w_100:format,png`