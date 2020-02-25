# 项目优化关键点记录
------------------


1. 结合 Vue 的异步组件和 Webpack 的动态导入，实现路由组件的懒加载。

2. Preload 有 as 属性，浏览器可以设置正确的资源加载优先级，这种方式可以确保资源根据其重要性依次加载， 所以，Preload既不会影响重要资源的加载，又不会让次要资源影响自身的加载；此外，preload 不会阻塞 windows 的 onload 事件

   它的作用是告诉浏览器加载下一页面可能会用到的资源，注意，是下一页面，而不是当前页面。因此该方法的加载优先级非常低，也就是说该方式的作用是加速下一个页面的加载速度

   【区分】

   　　preload 是告诉浏览器页面必定需要的资源，浏览器一定会加载这些资源

   　　prefetch 是告诉浏览器页面可能需要的资源，浏览器不一定会加载这些资源

   　　在VUE SSR生成的页面中，首页的资源均使用preload，而路由对应的资源，则使用prefetch

3. **按需引用**第三方库

4. 全局注册的组件改为局部注册

5. 项目依赖打包概况分析图，使用webpack-bundle-analyzer

6. 使用SplitChunksPlugin（webpack3用的是CommonsChunkPlugin）解决组件重复打包问题，同时把element-ui从初始化依赖包中分离出去，使每个模块在被gzip压缩后小于244(KiB)

7. 使用runtimeChunk分离webpack的runtime

8. 开启gzip打包

> Created at 2019-12-16 by Jhail.
