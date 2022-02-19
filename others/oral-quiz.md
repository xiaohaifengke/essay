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

![img](.\imgs\oral-quiz\cache2.png)

- 对比缓存

   Last-Modified & If-Modified-Since

   ETag & *If-None-Match*

![img](.\imgs\oral-quiz\cache4.png)



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
var d=s.replace(/(\B)(?=(\d{3})+(?!\d))/g, ",")
```



## 3. 介绍下Promise
### 3.1 Promise的基本概念

Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。

所谓`Promise`，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。

`Promise`对象有以下两个特点。

（1）对象的状态不受外界影响。`Promise`对象代表一个异步操作，有三种状态：`pending`（进行中）、`fulfilled`（已成功）和`rejected`（已失败）。只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。这也是`Promise`这个名字的由来，它的英语意思就是“承诺”，表示其他手段无法改变。

（2）一旦状态改变，就不会再变，任何时候都可以得到这个结果。`Promise`对象的状态改变，只有两种可能：从`pending`变为`fulfilled`和从`pending`变为`rejected`。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。如果改变已经发生了，你再对`Promise`对象添加回调函数，也会立即得到这个结果。这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

`Promise`也有一些缺点。

首先，then中要传一个回调函数，还是要通过回调函数的方式写代码，可读性还不是足够好。  
其次，无法取消`Promise`，一旦新建它就会立即执行，无法中途取消。  
第三，如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部，需要全局监听unhandleRejection事件才能监听到。  
第四，可能吞掉错误或异常，错误只能顺序处理，即便在Promise链最后添加catch方法，依然可能存在无法捕捉的错误（catch内部可能会出现错误）
第五，当处于`pending`状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

API用法：

- 接收一个同步调用的function,传入resolve和reject两个参数。resolve。。。reject。。。

- `Promise`拥有一个`then`方法，用以处理`resolved`或`rejected`状态下的值，这两个参数变量类型是函数，如果不是函数将会被忽略（会有穿透表现），并且这两个参数都是可选的。
- `then`方法必须返回一个新的`promise`，记作`promise2`，这也就保证了`promise`可以链式调用。
- 不同的`promise`实现可以的交互，依据是thenable对象的判断。

### 3.2 关于Promise的其它问题
#### 3.2.1 用setTimeout模拟回调，有两个问题：1. 是宏任务  2. 有4ms的延迟
​	解决方式： setImmediate 可以解决4ms的延迟。用MutationObserver可以产生微任务。
#### 3.2.2 如何停止一个Promise链？
​	在发生Big ERROR后return一个Promise，但这个Promise的executor函数什么也不做，这就意味着这个Promise将永远处于pending状态，由于then返回的Promise会直接取这个永远处于pending状态的Promise的状态，于是返回的这个Promise也将一直处于pending状态，后面的代码也就一直不会执行了。
```js
new Promise(function(resolve, reject) {
  resolve(42)
})
  .then(function(value) {
    // "Big ERROR!!!"
    return new Promise(function(){})
  })
  .catch()
  .then()
  .then()
  .catch()
  .then()
```

这种方式看起来有些山寨，它也确实解决了问题。但它引入的一个新问题就是链式调用后面的所有回调函数都无法被垃圾回收器回收（在一个靠谱的实现里，Promise应该在执行完所有回调后删除对所有回调函数的引用以让它们能被回收，在前文的实现里，为了减少复杂度，并没有做这种处理），但如果我们不使用匿名函数，而是使用函数定义或者函数变量的话，在需要多次执行的Promise链中，这些函数也都只有一份在内存中，不被回收也是可以接受的。

我们可以将返回一个什么也不做的Promise封装成一个有语义的函数，以增加代码的可读性：

```
Promise.cancel = Promise.stop = function() {
  return new Promise(function(){})
}
```

然后我们就可以这么使用了：

```
new Promise(function(resolve, reject) {
  resolve(42)
})
  .then(function(value) {
    // "Big ERROR!!!"
    return Promise.stop()
  })
  .catch()
  .then()
  .then()
  .catch()
  .then()
```

看起来是不是有语义的多？

#### 3.2.3 Promise链上返回的最后一个Promise出错了怎么办？

考虑如下代码：

```
new Promise(function(resolve) {
  resolve(42)
})
  .then(function(value) {
    alter(value)
  })
```

乍一看好像没什么问题，但运行这段代码的话你会发现什么现象也不会发生，既不会alert出42，也不会在控制台报错，怎么回事呢。细看最后一行，`alert`被打成了`alter`，那为什么控制台也没有报错呢，因为`alter`所在的函数是被包在`try/catch`块里的，`alter`这个变量找不到就直接抛错了，这个错就正好成了then返回的Promise的rejection reason。

也就是说，在Promise链的最后一个then里出现的错误，非常难以发现，有文章指出，可以在所有的Promise链的最后都加上一个catch，这样出错后就能被捕获到，这种方法确实是可行的，但是首先在每个地方都加上几乎相同的代码，违背了DRY原则，其次也相当的繁琐。另外，最后一个catch依然返回一个Promise，除非你能保证这个catch里的函数不再出错，否则问题依然存在。在Q中有一个方法叫done，把这个方法链到Promise链的最后，它就能够捕获前面未处理的错误，这其实跟在每个链后面加上catch没有太大的区别，只是由框架来做了这件事，相当于它提供了一个不会出错的catch链，我们可以这么实现done方法：

```
Promise.prototype.done = function(){
  return this.catch(function(e) { // 此处一定要确保这个函数不能再出错
    console.error(e)
  })
}
```

可是，能不能在不加catch或者done的情况下，也能够让开发者发现Promise链最后的错误呢？答案依然是肯定的。

我们可以在一个Promise被reject的时候检查这个Promise的onRejectedCallback数组，如果它为空，则说明它的错误将没有函数处理，这个时候，我们需要把错误输出到控制台，让开发者可以发现。以下为具体实现：

```
function reject(reason) {
  setTimeout(function() {
    if (self.status === 'pending') {
      self.status = 'rejected'
      self.data = reason
      if (self.onRejectedCallback.length === 0) {
        console.error(reason)
      }
      for (var i = 0; i < self.rejectedFn.length; i++) {
        self.rejectedFn[i](reason)
      }
    }
  })
}
```

上面的代码对于以下的Promise链也能处理的很好：

```
new Promise(function(){ // promise1
  reject(3)
})
  .then() // returns promise2
  .then() // returns promise3
  .then() // returns promise4
```

看起来，promise1，2，3，4都没有处理函数，那是不是会在控制台把这个错误输出4次呢，并不会，实际上，promise1，2，3都隐式的有处理函数，就是then的默认参数，各位应该还记得then的默认参数最终是被push到了Promise的callback数组里。只有promise4是真的没有任何callback，因为压根就没有调用它的then方法。

事实上，Bluebird和ES6 Promise都做了类似的处理，在Promise被reject但又没有callback时，把错误输出到控制台。

Q使用了done方法来达成类似的目的，$q在最新的版本中也加入了类似的功能。

#### 3.2.4 finally方法

`finally`方法用于无论是`resolve`还是`reject`，`finall`y的参数函数都会被执行。

```
  finally(fn) {
    return this.then(value => {
      fn();
      return value;
    }, reason => {
      fn();
      throw reason;
    });
  };
```

#### 3.2.5 Promise.all方法

`Promise.all`方法接收一个`promise`数组，返回一个新`promise2`，并发执行数组中的全部`promise`，所有`promise`状态都为`resolved`时，`promise2`状态为`resolved`并返回全部`promise`结果，结果顺序和`promise`数组顺序一致。如果有一个`promise`为`rejected`状态，则整个`promise2`进入`rejected`状态。

```
  static all(promiseList) {
    return new Promise((resolve, reject) => {
      const result = [];
      let i = 0;
      for (const p of promiseList) {
        p.then(value => {
          result[i] = value;
          if (result.length === promiseList.length) {
            resolve(result);
          }
        }, reject);
        i++;
      }
    });
  }
```

#### 3.2.6 Promise.race方法

`Promise.race`方法接收一个`promise`数组, 返回一个新`promise2`，顺序执行数组中的`promise`，有一个`promise`状态确定，`promise2`状态即确定，并且同这个`promise`的状态一致。

```
  static race(promiseList) {
    return new Promise((resolve, reject) => {
      for (const p of promiseList) {
        p.then(resolve, reject);
      }
    });
  }
```

#### 3.2.7 Promise.resolve方法/Promise.reject

`Promise.resolve`用来生成一个`rejected`完成态的`promise`，`Promise.reject`用来生成一个`rejected`失败态的`promise`。

```
  static resolve(value) {
    let promise;

    promise = new Promise((resolve, reject) => {
      this.resolvePromise(promise, value, resolve, reject);
    });
  
    return promise;
  }
  
  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }
```

常用的方法基本就这些，`Promise`还有很多扩展方法。

#### 3.2.8 使用Promise进行顺序（sequence）处理

1、使用`async`函数配合`await`或者使用`generator`函数配合`yield`。2、使用`promise.then`通过`for`循环或者`Array.prototype.reduce`实现。3、通过Array.prototype.reduce拍平promise数组

```
function sequenceTasks(tasks) {
    function recordValue(results, value) {
        results.push(value);
        return results;
    }
    var pushValue = recordValue.bind(null, []);
    return tasks.reduce(function (promise, task) {
        return promise.then(() => task).then(pushValue);
    }, Promise.resolve());
}
```

#### 3.2.9 Promise存在哪些使用技巧或者最佳实践？

1. 合理的使用`Promise.all`和`Promise.race`等方法。

2. 在写`promise`链式调用的时候，`then`方法不传`onRejected`函数，只需要在最末尾加一`个catch()`就可以了，这样在该链条中的`promise`发生的错误都会被最后的`catch`捕获到。如果`catch()`代码有出现错误的可能，需要在链式调用的末尾增加`done()`函数。

## 4. 作用域链

每一段javascript代码都有一段与之关联的作用域链（scope chain）,这个作用域链是一个对象列表或者链表，这组对象定义了这段代码作用域中的变量。当javascript需要查找某个变量（设属性为x）的时候（即变量解析），它会从链中的第一个对象开始查找，如果这个对象中有x这个属性。则会直接使用这个属性。如果没有则继续查找链上下一个对象，以此类推。如果作用域链上没有任何一个对象含有属性x，那么就认为这段代码的作用域上不存在x，并最终抛出一个引用错误（ReferenceError）异常。这种一层一层的关系，就是 作用域链 。

## 5. Event Loop 相关

#### 5.1 什么是 Event Loop

JavaScript语言的一大特点就是单线程。单线程就意味着，所有任务需要排队，前一个任务结束，才会执行后一个任务。在js中，所有任务可以分成两种，一种是同步任务（synchronous），另一种是异步任务（asynchronous）。同步任务指的是，在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务；异步任务指的是，不进入主线程、而进入"任务队列"（task queue）的任务，只有"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行。

具体来说，异步执行的运行机制如下。

> （1）所有同步任务都在主线程上执行，形成一个[执行栈](https://www.ruanyifeng.com/blog/2013/11/stack.html)（execution context stack）。
>
> （2）主线程之外，还存在一个"任务队列"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。
>
> （3）一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。
>
> （4）主线程不断重复上面的第三步。

下图就是主线程和任务队列的示意图。

![任务队列](.\imgs\oral-quiz\bg2014100801.jpg)

只要主线程空了，就会去读取"任务队列"，这就是JavaScript的运行机制。这个过程会不断重复。

**主线程从"任务队列"中读取事件，这个过程是循环不断的，所以整个的这种运行机制又称为Event Loop（事件循环）。**

#### 5.2 简述 Macrotasks 和 Microtasks 的执行方式
js加载script标签，即建立了第一个Macrotask，该执行过程可能会产生其它的 Macrotask 和 Microtask 并分别放入Macrotasks 和 Microtasks。 在当前Macrotask执行完后，会执行 Microtasks 中的所有的Microtask，执行过程中产生的Macrotask 和 Microtask 同样会追加到 Macrotasks 和 Microtasks， 该过程会把所有的（包括执行过程中追加的）Microtask执行完之后再从Macrotasks中取下一个Macrotask，执行完后再执行所有的Microtask，如此反复。