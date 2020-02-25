# Event Loop
------------

  本篇主要是为了记录一些好文章的地址
  - #### Event Loop
    看了一些关于Event Loop的博客，本想自己再来整理一下，无意间看到阮一峰大神关于Event Loop的文章，感觉很好，简单易懂，故在此留个传送门。
    [阮一峰 - JavaScript 运行机制详解：再谈Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)  
    再贴个上文中提到的视频介绍的链接：[Philip Roberts - Help,I’m stuck in an event loop](http://v.youku.com/v_show/id_XODA0MDYyNTcy.html)

  - #### Macrotasks 和 Microtasks
    1. 简介：  
      js中异步任务分为两种，即 Macrotasks（宏任务） 和 Microtasks（微任务）。产生两种异步任务的方式如下：  
      **macrotasks:** script tag, setTimeout, setInterval, setImmediate, requestAnimationFrame, I/O, UI rendering  
      **microtasks:** process.nextTick, Promises, Object.observe, MutationObserver  
      其中：  
      setImmediate为非标准特性，该方法可能不会被批准成为标准，目前只有最新版本的 Internet Explorer 和Node.js 0.10+实现了该方法，它遇到了 Gecko(Firefox) 和Webkit (Google/Apple) 的阻力；  
      process.nextTick为Node环境；  
      Object.observe已被废弃了；
    
    2. 简述 Macrotasks 和 Microtasks 的执行方式  
      js加载script标签，即建立了第一个Macrotask，该执行过程可能会产生其它的 Macrotask 和 Microtask 并分别放入Macrotasks 和 Microtasks。
      在当前Macrotask执行完后，会执行 Microtasks 中的所有的Microtask，执行过程中产生的Macrotask 和 Microtask 同样会追加到 Macrotasks 和 Microtasks，
      该过程会把所有的（包括执行过程中追加的）Microtask执行完之后再从Macrotasks中取下一个Macrotask，执行完后再执行所有的Microtask，如此反复。
      
      收录一个很不错的关于Macrotasks 和 Microtasks的问答。[Difference between microtask and macrotask within an event loop context](https://stackoverflow.com/questions/25915634/difference-between-microtask-and-macrotask-within-an-event-loop-context)
      
