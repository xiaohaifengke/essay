# Review

## 1. 浏览器请求静态资源文件的过程

### http缓存问题

- 强制缓存 (Cache-Control && Expires)

  Cache-Control:

  - private 客户端可以缓存
  - public 客户端和代理服务器都可以缓存
  - max-age=60 缓存内容将在60秒后失效
  - no-cache 需要使用对比缓存验证数据,强制向源服务器再次验证 (可以在本地缓存，可以在代理服务器缓存，但是这个缓存要服务器验证才可以使用。没有强制缓存)
  - no-store 所有内容都不会缓存，强制缓存和对比缓存都不会触发 (不缓存)

![img](G:\workspace\essay\others\imgs\oral-quiz\cache2.png)

- 对比缓存

   Last-Modified & If-Modified-Since

   ETag & *If-None-Match*

![img](G:\workspace\essay\others\imgs\oral-quiz\cache4.png)



浏览器在加载资源时会先看缓存中是否有数据，若无则下载。服务器返回 200，浏览器从服务器下载资源文件，并缓存资源文件与 response header，以供下次加载时对比使用；



下一次加载资源时，由于强制缓存优先级较高，先比较当前时间与上一次返回 200 时的时间差，如果没有超过 cache-control 设置的 max-age，则没有过期，并命中强缓存，直接从本地读取资源。如果浏览器不支持 HTTP1.1，则使用 expires 头判断是否过期；



如果资源已过期，则表明强制缓存没有被命中，则开始协商缓存，向服务器发送带有 If-None-Match 和 If-Modified-Since 的请求；



服务器收到请求后，优先根据 Etag 的值判断被请求的文件有没有做修改，Etag 值一致则没有修改，命中协商缓存，返回 304；如果不一致则有改动，直接返回新的资源文件带上新的 Etag 值并返回 200；



如果服务器收到的请求没有 Etag 值，则将 If-Modified-Since 和被请求文件的最后修改时间做比对，一致则命中协商缓存，返回 304；不一致则返回新的 last-modified 和文件并返回 200

## 2. 金额格式化

```js
// 1
function toThousandFilter(num) {
  return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}
// 2
var s = '12345237987584564656,000.00';
var d=s.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
```



## 3. 介绍下Promise

Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。

所谓`Promise`，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

`Promise`对象有以下两个特点。

（1）对象的状态不受外界影响。`Promise`对象代表一个异步操作，有三种状态：`pending`（进行中）、`fulfilled`（已成功）和`rejected`（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是`Promise`这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。

（2）一旦状态改变，就不会再变，任何时候都可以得到这个结果。`Promise`对象的状态改变，只有两种可能：从`pending`变为`fulfilled`和从`pending`变为`rejected`。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。如果改变已经发生了，你再对`Promise`对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

`Promise`也有一些缺点。

首先，无法取消`Promise`，一旦新建它就会立即执行，无法中途取消。其次，如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部。第三，当处于`pending`状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

API用法：

- 接收一个同步调用的function,传入resolve和reject两个参数。resolve。。。reject。。。

- `Promise`拥有一个`then`方法，用以处理`resolved`或`rejected`状态下的值，这两个参数变量类型是函数，如果不是函数将会被忽略（会有穿透表现），并且这两个参数都是可选的。
- `then`方法必须返回一个新的`promise`，记作`promise2`，这也就保证了`promise`可以链式调用。
- 不同的`promise`实现可以的交互，依据是thenable对象的判断。