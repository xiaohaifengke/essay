# 关于debounce、throttle和rAF
----------------------------

- 先安利一篇 David Corbacho 大神的文章 [Debouncing and Throttling Explained Through Examples](https://css-tricks.com/debouncing-throttling-explained-examples/)。  
  简要记录下学习结论：
  
  > - **debounce:**将短时间内（两次事件触发间隔小于指定时间）被触发多次的事件分为一组，并仅在该组最后一个事件被触发过指定时间后或第一个事件被触发时（由参数leading/trailing指定）才真正的执行事件对应的回调函数。  
  >   场景举例：  
  >   - 输入完成后自动进行后续操作的输入框。（如输入完后自动查询或者自动进行合法性校验）
  >   - 在浏览器窗口resize时，只关心最终的窗口大小时。
  >   - 防止用户短时间内频繁点击按钮或其它操作的场景。
  >   
  > - **throttle:**控制事件对应的回调函数每隔指定的时间触发一次，能使事件均匀的被触发。  
  >   场景举例：  
  >   - 在浏览器窗口resize或scroll时，关心该操作的过程，控制resize或scroll事件回调函数执行的频率。
  >   - mousemove等会在短时间内频发触发的事件的场景
  >   
  > - **requestAnimationFrame:**浏览器原生API，和 `throttle` 有一定的相似性，间隔时间不能指定，更倾向于用在使动画更平滑的场景。**注意：不支持IE9**。

- 当在项目中需要使用`debounce`和`throttle`时，建议直接使用`Lodash`库。  
  为了避免因为使用lodash中的个别方法而引入整个lodash库，可以使用如下方式：

  - 在使用webpack/browserify/rollup等构建工具的项目中可以：
    ```ecmascript 6
    import { debounce } from 'lodash';
    // or
    // const debounce = require('lodash/debounce');
    ```

  - 未使用打包工具的项目中可以：
    ```Command Line
    npm i -g lodash-cli
    lodash include = debounce, throttle
    ```
