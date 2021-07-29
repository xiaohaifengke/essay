# 项目优化关键点记录
------------------
## 一、编码层面优化

   1. 不要将所有的数据都放在data中，data中的数据都会增加getter和setter，会收集对应的watcher.
   2. Object.freeze 冻结数据，阻止Vue对某个数据进行响应式劫持。
   3. 对于大数据量列表，Vue 在 v-for 时给每项元素绑定事件可以用事件代理的方式。
   4. vue项目中key 保证唯一性 ( 默认 vue 会采用就地复用策略 )。
   5. SPA 页面采用keep-alive缓存组件。
   6. 结合 Vue 的异步组件和 Webpack 的动态导入，实现路由组件的懒加载。
   7. 合理使用v-if 和 v-show。
   8. v-if与v-for连用时，因为v-for 具有比 v-if 更高的优先级，所以列表的每项都要判断判断条件v-if，所以通常先处理列表数据后再用v-for渲染会更好。
   9. 全局注册的组件改为局部注册。
   10. 合理使用防抖、节流。
   11. 利用webpack的Tree Shaking特性

## 二、打包层面优化

   1. 代码压缩
   2. **按需引用** 第三方库 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)。
   3. 配置webpack [externals](https://webpack.docschina.org/configuration/externals/#externals)。
   4. 使用 splitChunks 抽离公共模块。
   5. 使用url-loader把小图片转换为base64编码，减少网络请求。（同时也会增大模块体积，且不利于图片缓存）。
   6. 使用[runtimeChunk](https://webpack.js.org/configuration/optimization/#optimizationruntimechunk)分离webpack的runtime。
   7. 使用[webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)分析项目依赖打包概况。
   8. 多线程打包，加快打包速度，使用 happypack。

## 三、网络传输层面的优化

   1. 使用 CDN 的方式加载第三方模块
   > - CDN 又叫内容分发网络，通过把资源部署到世界各地，用户在访问时按照就近原则从离用户最近的服务器获取资源，从而加速资源的获取速度。
   > - 启用CDN之后，资源的相对路径都变成了指向 CDN 服务的绝对的 URL 地址。
   > - 因为浏览器在同一时刻针对同一个域名的资源并行请求数量是有限制的，所以为了并行加载不阻塞，可以把不同的静态资源分配到不同的CDN服务器上。
   > - 静态资源部署到多个域名后会增加域名解析的时间，可以通过在 HTML HEAD 标签中加入`<link rel="dns-prefetch" href="http://xxx.xxxxxx.cn">`去预解析域名，以降低域名解析带来的延迟。
   
   2. 服务器配置静态文件缓存
   > - 由于 CDN 服务一般都会给资源开启很长时间的缓存，例如用户从 CDN 上获取到了 index.html 这个文件后， 即使之后的发布操作把 index.html 文件给重新覆盖了，但是用户在很长一段时间内还是运行的之前的版本，这会导致新发布的版本不能立即生效。所以HTML文件不应该缓存，可以放在自己的服务器上，关闭自己服务器的缓存。静态资源的URL变成指向CDN服务器的地址。自己的服务器只提供 HTML 文件和数据接口。
   > - 针对静态的 JavaScript、CSS、图片等文件：开启 CDN 和缓存，上传到 CDN 服务上去，同时给每个文件名带上由文件内容算出的 Hash 值。带上 contenthash 值的原因是文件名会随着文件内容而变化，只要文件发生变化其对应的 URL 就会变化，它就会被重新下载，无论缓存时间有多长。

   3. 服务器开启gzip压缩

## 四、加载性能优化

   1. 合理使用 preload 和 prefetch。
   2. 滚动到可视区域动态加载 [vue-virtual-scroll-list](https://tangbc.github.io/vue-virtual-scroll-list) 。
   3. 图片懒加载 [vue-lazyload](https://github.com/hilongjw/vue-lazyload.git) 。


## 五、用户体验角度优化

   1. app-skeleton 骨架屏。


## 六、SEO优化

   1. 使用预渲染插件 prerender-spa-plugin。
   2. 服务端渲染 SSR。


> 注：  
> Preload 有 as 属性，浏览器可以设置正确的资源加载优先级，这种方式可以确保资源根据其重要性依次加载， 所以，Preload既不会影响重要资源的加载，又不会让次要资源影响自身的加载；此外，preload 不会阻塞 windows 的 onload 事件。  
> 它的作用是告诉浏览器加载下一页面可能会用到的资源，注意，是下一页面，而不是当前页面。因此该方法的加载优先级非常低，也就是说该方式的作用是加速下一个页面的加载速度
>
>   【区分】
>
>   　　preload 是告诉浏览器页面必定需要的资源，浏览器一定会加载这些资源。  
>   　　prefetch 是告诉浏览器页面可能需要的资源，浏览器不一定会加载这些资。
>
>   　　在VUE SSR生成的页面中，首页的资源均使用preload，而路由对应的资源，则使用prefetch。

> Created at 2019-12-16 by Jhail.  
> Updated at 2021-07-28 by Jhail.
