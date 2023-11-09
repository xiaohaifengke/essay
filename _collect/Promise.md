## Promise

> 原文地址：https://mp.weixin.qq.com/s/3Hr_2M-0UBGQk26mIIMeFQ

## 写在前面

`Javascript`异步编程先后经历了四个阶段，分别是`Callback`阶段，`Promise`阶段，`Generator`阶段和`Async/Await`阶段。`Callback`很快就被发现存在回调地狱和控制权问题，`Promise`就是在这个时间出现，用以解决这些问题，`Promise`并非一个新事务，而是按照一个规范实现的类，这个规范有很多，如 `Promise/A`，`Promise/B`，`Promise/D`以及 `Promise/A` 的升级版 `Promise/A+`，最终 ES6 中采用了 Promise/A+ 规范。后来出现的`Generator`函数以及`Async`函数也是以`Promise`为基础的进一步封装，可见`Promise`在异步编程中的重要性。

关于`Promise`的资料已经很多，但每个人理解都不一样，不同的思路也会有不一样的收获。这篇文章会着重写一下`Promise`的实现以及笔者在日常使用过程中的一些心得体会。

## 实现Promise

#### 规范解读

Promise/A+规范主要分为术语、要求和注意事项三个部分，我们重点看一下第二部分也就是要求部分，以笔者的理解大概说明一下，具体细节参照完整版Promise/A+标准。

> 1、`Promise`有三种状态`pending`，`fulfilled`和`rejected`。（为了一致性，此文章称`fulfilled`状态为`resolved`状态）
>
> > - 状态转换只能是`pending`到`resolved`或者`pending`到`rejected`；
> > - 状态一旦转换完成，不能再次转换。
>
> 2、`Promise`拥有一个`then`方法，用以处理`resolved`或`rejected`状态下的值。
>
> > - `then`方法接收两个参数`onFulfilled`和`onRejected`，这两个参数变量类型是函数，如果不是函数将会被忽略，并且这两个参数都是可选的。
> > - `then`方法必须返回一个新的`promise`，记作`promise2`，这也就保证了`then`方法可以在同一个`promise`上多次调用。（ps：规范只要求返回`promise`，并没有明确要求返回一个新的`promise`，这里为了跟ES6实现保持一致，我们也返回一个新`promise`）
> > - `onResolved/onRejected`有返回值则把返回值定义为`x`，并执行[[Resolve]](promise2, x);
> > - `onResolved/onRejected`运行出错，则把`promise2`设置为`rejected`状态；
> > - `onResolved/onRejected`不是函数，则需要把`promise1`的状态传递下去（也称Promise值的穿透）。
>
> 3、不同的`promise`实现可以的交互。
>
> > - 规范中称这一步操作为`promise`解决过程，函数标示为[[Resolve]](promise, x)，`promise`为要返回的新`promise`对象，`x`为`onResolved/onRejected`的返回值。如果`x`有`then`方法且看上去像一个`promise`，我们就把x当成一个`promis`e的对象，即`thenable`对象，这种情况下尝试让`promise`接收`x`的状态。如果`x`不是`thenable`对象，就用`x`的值来执行 `promise`。
> >
> > - [[Resolve]](promise, x)函数具体运行规则：
> >
> > - - 如果 `promise` 和 `x` 指向同一对象，以 `TypeError` 为据因拒绝执行 `promise`;
> >   - 如果 `x` 为 `Promise` ，则使 `promise` 接受 `x` 的状态;
> >   - 如果 `x` 为对象或者函数，取`x.then`的值，如果取值时出现错误，则让`promise`进入`rejected`状态，如果`then`不是函数，说明`x`不是`thenable`对象，直接以`x`的值`resolve`，如果`then`存在并且为函数，则把`x`作为`then`函数的作用域`this`调用，`then`方法接收两个参数，`resolvePromise`和`rejectPromise`，如果`resolvePromise`被执行，则以`resolvePromise`的参数`value`作为`x`继续调用[[Resolve]](promise, value)，直到`x`不是对象或者函数，如果`rejectPromise`被执行则让`promise`进入`rejected`状态；
> >   - 如果 `x` 不是对象或者函数，直接就用`x`的值来执行`promise`。

#### 代码实现

规范解读第1条，代码实现：

```
class Promise {
  // 定义Promise状态，初始值为pending
  status = 'pending';
  // 状态转换时携带的值，因为在then方法中需要处理Promise成功或失败时的值，所以需要一个全局变量存储这个值
  data = '';

  // Promise构造函数，传入参数为一个可执行的函数
  constructor(executor) {
    // resolve函数负责把状态转换为resolved
    function resolve(value) {
      this.status = 'resolved';
      this.data = value;
    }
    // reject函数负责把状态转换为rejected
    function reject(reason) {
      this.status = 'rejected';
      this.data = reason;
    }

    // 直接执行executor函数，参数为处理函数resolve, reject。因为executor执行过程有可能会出错，错误情况需要执行reject
    try {
      executor(resolve, reject);
    } catch(e) {
      reject(e)
    }
  }
}
```

第1条就是实现完毕了，相对简单，配合代码注释很容易理解。

规范解读第2条，代码实现：

```
  /**
    * 拥有一个then方法
    * then方法提供：状态为resolved时的回调函数onResolved，状态为rejected时的回调函数onRejected
    * 返回一个新的Promise
  */
  then(onResolved, onRejected) {
    // 设置then的默认参数，默认参数实现Promise的值的穿透
    onResolved = typeof onResolved === 'function' ? onResolved : function(v) { return e };
    onRejected = typeof onRejected === 'function' ? onRejected : function(e) { throw e };
    
    let promise2;
    
    promise2 =  new Promise((resolve, reject) => {
      // 如果状态为resolved，则执行onResolved
      if (this.status === 'resolved') {
        try {
          // onResolved/onRejected有返回值则把返回值定义为x
          const x = onResolved(this.data);
          // 执行[[Resolve]](promise2, x)
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }
      // 如果状态为rejected，则执行onRejected
      if (this.status === 'rejected') {
        try {
          const x = onRejected(this.data);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }
    });
    
    return promise2;
  }
```

现在我们就按照规范解读第2条，实现了上述代码，上述代码很明显是有问题的，问题如下

1. `resolvePromise`未定义；
2. `then`方法执行的时候，`promise`可能仍然处于`pending`状态，因为`executor`中可能存在异步操作（实际情况大部分为异步操作），这样就导致`onResolved/onRejected`失去了执行时机；
3. `onResolved/onRejected`这两个函数需要异步调用(官方`Promise`实现的回调函数总是异步调用的)。

解决办法：

1. 根据规范解读第3条，定义并实现`resolvePromise`函数；
2. `then`方法执行时如果`promise`仍然处于`pending`状态，则把处理函数进行储存，等`resolve/reject`函数真正执行的的时候再调用。
3. `promise.then`属于微任务，这里我们为了方便，用宏任务`setTiemout`来代替实现异步，具体细节特别推荐[这篇文章](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651228065&idx=2&sn=0db2e69aa9344d4b086e9d98301aebad&scene=21#wechat_redirect)。

好了，有了解决办法，我们就把代码进一步完善：

```
class Promise {
  // 定义Promise状态变量，初始值为pending
  status = 'pending';
  // 因为在then方法中需要处理Promise成功或失败时的值，所以需要一个全局变量存储这个值
  data = '';
  // Promise resolve时的回调函数集
  onResolvedCallback = [];
  // Promise reject时的回调函数集
  onRejectedCallback = [];

  // Promise构造函数，传入参数为一个可执行的函数
  constructor(executor) {
    // resolve函数负责把状态转换为resolved
    function resolve(value) {
      this.status = 'resolved';
      this.data = value;
      for (const func of this.onResolvedCallback) {
        func(this.data);
      }
    }
    // reject函数负责把状态转换为rejected
    function reject(reason) {
      this.status = 'rejected';
      this.data = reason;
      for (const func of this.onRejectedCallback) {
        func(this.data);
      }
    }

    // 直接执行executor函数，参数为处理函数resolve, reject。因为executor执行过程有可能会出错，错误情况需要执行reject
    try {
      executor(resolve, reject);
    } catch(e) {
      reject(e)
    }
  }
  /**
    * 拥有一个then方法
    * then方法提供：状态为resolved时的回调函数onResolved，状态为rejected时的回调函数onRejected
    * 返回一个新的Promise
  */
  then(onResolved, onRejected) {

    // 设置then的默认参数，默认参数实现Promise的值的穿透
    onResolved = typeof onResolved === 'function' ? onResolved : function(v) { return e };
    onRejected = typeof onRejected === 'function' ? onRejected : function(e) { throw e };

    let promise2;

    promise2 =  new Promise((resolve, reject) => {
      // 如果状态为resolved，则执行onResolved
      if (this.status === 'resolved') {
        setTimeout(() => {
          try {
            // onResolved/onRejected有返回值则把返回值定义为x
            const x = onResolved(this.data);
            // 执行[[Resolve]](promise2, x)
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      // 如果状态为rejected，则执行onRejected
      if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.data);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      // 如果状态为pending，则把处理函数进行存储
      if (this.status = 'pending') {
        this.onResolvedCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onResolved(this.data);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });

        this.onRejectedCallback.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.data);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }

    });

    return promise2;
  }

  // [[Resolve]](promise2, x)函数
  resolvePromise(promise2, x, resolve, reject) {
    
  }
  
}
```

至此，规范中关于`then`的部分就全部实现完毕了。代码添加了详细的注释，参考注释不难理解。

规范解读第3条，代码实现：

```
// [[Resolve]](promise2, x)函数
  resolvePromise(promise2, x, resolve, reject) {
    let called = false;

    if (promise2 === x) {
      return reject(new TypeError('Chaining cycle detected for promise!'))
    }
    
    // 如果x仍然为Promise的情况
    if (x instanceof Promise) {
      // 如果x的状态还没有确定，那么它是有可能被一个thenable决定最终状态和值，所以需要继续调用resolvePromise
      if (x.status === 'pending') {
        x.then(function(value) {
          resolvePromise(promise2, value, resolve, reject)
        }, reject)
      } else { 
        // 如果x状态已经确定了，直接取它的状态
        x.then(resolve, reject)
      }
      return
    }
  
    if (x !== null && (Object.prototype.toString(x) === '[object Object]' || Object.prototype.toString(x) === '[object Function]')) {
      try {
        // 因为x.then有可能是一个getter，这种情况下多次读取就有可能产生副作用，所以通过变量called进行控制
        const then = x.then 
        // then是函数，那就说明x是thenable，继续执行resolvePromise函数，直到x为普通值
        if (typeof then === 'function') { 
          then.call(x, (y) => { 
            if (called) return;
            called = true;
            this.resolvePromise(promise2, y, resolve, reject);
          }, (r) => {
            if (called) return;
            called = true;
            reject(r);
          })
        } else { // 如果then不是函数，那就说明x不是thenable，直接resolve x
          if (called) return ;
          called = true;
          resolve(x);
        }
      } catch (e) {
        if (called) return;
        called = true;
        reject(e);
      }
    } else {
      resolve(x);
    }
  }
```

这一步骤非常简单，只要按照规范转换成代码即可。

最后，完整的`Promise`按照规范就实现完毕了，是的，规范里并没有规定`catch`、`Promise.resolve`、`Promise.reject`、`Promise.all`等方法，接下来，我们就看一看`Promise`的这些常用方法。

#### Promise其他方法实现

##### 1、catch方法

`catch`方法是对`then`方法的封装，只用于接收`reject(reason)`中的错误信息。因为在`then`方法中`onRejected`参数是可不传的，不传的情况下，错误信息会依次往后传递，直到有`onRejected`函数接收为止，因此在写`promise`链式调用的时候，`then`方法不传`onRejected`函数，只需要在最末尾加一个`catch()`就可以了，这样在该链条中的`promise`发生的错误都会被最后的`catch`捕获到。

```
  catch(onRejected) {
    return this.then(null, onRejected);
  }
```

##### 2、done方法

`catch`在`promise`链式调用的末尾调用，用于捕获链条中的错误信息，但是`catch`方法内部也可能出现错误，所以有些`promise`实现中增加了一个方法`done`，`done`相当于提供了一个不会出错的`catch`方法，并且不再返回一个`promise`，一般用来结束一个`promise`链。

```
  done() {
    this.catch(reason => {
      console.log('done', reason);
      throw reason;
    });
  }
```

##### 3、finally方法

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

##### 4、Promise.all方法

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

##### 5、Promise.race方法

`Promise.race`方法接收一个`promise`数组, 返回一个新`promise2`，顺序执行数组中的`promise`，有一个`promise`状态确定，`promise2`状态即确定，并且同这个`promise`的状态一致。

```
  static race(promiseList) {
    return new Promise((resolve, reject) => {
      for (const p of promiseList) {
        p.then((value) => {
          resolve(value);   
        }, reject);
      }
    });
  }
```

##### 6、Promise.resolve方法/Promise.reject

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

常用的方法基本就这些，`Promise`还有很多扩展方法，这里就不一一展示，基本上都是对`then`方法的进一步封装，只要你的`then`方法没有问题，其他方法就都可以依赖`then`方法实现。

## Promise面试相关

面试相关问题，笔者只说一下我司这几年的情况，并不能代表全部情况，参考即可。`Promise`是我司前端开发职位，`nodejs`开发职位，全栈开发职位，必问的一个知识点，主要问题会分布在`Promise`介绍、基础使用方法以及深层次的理解三个方面，问题一般在3-5个，根据面试者回答情况会适当增减。

##### 1、简单介绍下Promise。

`Promise` 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。它由社区最早提出和实现，ES6 将其写进了语言标准，统一了用法，原生提供了`Promise`对象。有了`Promise`对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，`Promise`对象提供统一的接口，使得控制异步操作更加容易。（当然了也可以简单介绍`promise`状态，有什么方法，`callback`存在什么问题等等，这个问题是比较开放的）

- 提问概率：99%
- 评分标准：人性化判断即可，此问题一般作为引入问题。
- 加分项：熟练说出Promise具体解决了那些问题，存在什么缺点，应用方向等等。

##### 2、实现一个简单的，支持异步链式调用的Promise类。

这个答案不是固定的，可以参考最简实现 Promise，支持异步链式调用

- 提问概率：50%（手撸代码题，因为这类题目比较耗费时间，一场面试并不会出现很多，所以出现频率不是很高，但却是必备知识）
- 加分项：基本功能实现的基础上有`onResolved/onRejected`函数异步调用，错误捕获合理等亮点。

##### 3、Promise.then在Event Loop中的执行顺序。(可以直接问，也可以出具体题目让面试者回答打印顺序)

`JS`中分为两种任务类型：`macrotask`和`microtask`，其中`macrotask`包含：主代码块，`setTimeout`，`setInterval`，`setImmediate`等（`setImmediate`规定：在下一次`Event Loop`（宏任务）时触发）；`microtask`包含：`Promise`，`process.nextTick`等（在`node`环境下，`process.nextTick`的优先级高于`Promise`）`Event Loop`中执行一个`macrotask`任务（栈中没有就从事件队列中获取）执行过程中如果遇到`microtask`任务，就将它添加到微任务的任务队列中，`macrotask`任务执行完毕后，立即执行当前微任务队列中的所有`microtask`任务（依次执行），然后开始下一个`macrotask`任务（从事件队列中获取） 浏览器运行机制可参考[这篇文章](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651228065&idx=2&sn=0db2e69aa9344d4b086e9d98301aebad&scene=21#wechat_redirect)

- 提问概率：75%（可以理解为4次面试中3次会问到，顺便可以考察面试者对`JS`运行机制的理解）
- 加分项：扩展讲述浏览器运行机制。

##### 4、阐述Promise的一些静态方法。

`Promise.deferred`、`Promise.all`、`Promise.race`、`Promise.resolve`、`Promise.reject`等

- 提问概率：25%（相对基础的问题，一般在其他问题回答不是很理想的情况下提问，或者为了引出下一个题目而提问）
- 加分项：越多越好

##### 5、Promise存在哪些缺点。

1、无法取消`Promise`，一旦新建它就会立即执行，无法中途取消。2、无法获取到`Promise`的进度。 3、如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部。4、吞掉错误或异常，错误只能顺序处理，即便在`Promise`链最后添加`catch`方法，依然可能存在无法捕捉的错误（`catch`内部可能会出现错误） 5、阅读代码不是一眼可以看懂，你只会看到一堆`then`，必须自己在`then`的回调函数里面理清逻辑。

- 提问概率：25%（此问题作为提高题目，出现概率不高）
- 加分项：越多越合理越好（网上有很多说法，不一一佐证） （此题目，欢迎大家补充答案）

##### 6、使用Promise进行顺序（sequence）处理。

1、使用`async`函数配合`await`或者使用`generator`函数配合`yield`。2、使用`promise.then`通过`for`循环或者`Array.prototype.reduce`实现。

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

- 提问概率：90%（我司提问概率极高的题目，即能考察面试者对`promise`的理解程度，又能考察编程逻辑，最后还有`bind`和`reduce`等方法的运用）
- 评分标准：说出任意解决方法即可，其中只能说出`async`函数和`generator`函数的可以得到20%的分数，可以用`promise.then`配合`for`循环解决的可以得到60%的分数，配合`Array.prototype.reduce`实现的可以得到最后的20%分数。

##### 7、如何停止一个Promise链？

在要停止的`promise`链位置添加一个方法，返回一个永远不执行`resolve`或者`reject`的`Promise`，那么这个`promise`永远处于`pending`状态，所以永远也不会向下执行`then`或`catch`了。这样我们就停止了一个`promise`链。

```
    Promise.cancel = Promise.stop = function() {
      return new Promise(function(){})
    }
```

- 提问概率：50%（此问题主要考察面试者罗辑思维） （此题目，欢迎大家补充答案）

##### 8、Promise链上返回的最后一个Promise出错了怎么办？

`catch`在`promise`链式调用的末尾调用，用于捕获链条中的错误信息，但是`catch`方法内部也可能出现错误，所以有些`promise`实现中增加了一个方法`done`，`done`相当于提供了一个不会出错的`catch`方法，并且不再返回一个`promise`，一般用来结束一个`promise`链。

```
  done() {
    this.catch(reason => {
      console.log('done', reason);
      throw reason;
    });
  }
```

- 提问概率：90%（同样作为出题率极高的一个题目，充分考察面试者对`promise`的理解程度）
- 加分项：给出具体的`done()`方法代码实现

##### 9、Promise存在哪些使用技巧或者最佳实践？

1、链式`promise`要返回一个`promise`，而不只是构造一个`promise`。2、合理的使用`Promise.all`和`Promise.race`等方法。3、在写`promise`链式调用的时候，`then`方法不传`onRejected`函数，只需要在最末尾加一`个catch()`就可以了，这样在该链条中的`promise`发生的错误都会被最后的`catch`捕获到。如果`catch()`代码有出现错误的可能，需要在链式调用的末尾增加`done()`函数。

- 提问概率：10%（出题概率极低的一个题目）
- 加分项：越多越好

至此，我司关于`Promise`的一些面试题目就列举完毕了，有些题目的答案是开放的，欢迎大家一起补充完善。总结起来，`Promise`作为js面试必问部分还是相对容易掌握并通过的。

## 总结

Promise作为所有js开发者的必备技能，其实现思路值得所有人学习，通过这篇文章，希望小伙伴们在以后编码过程中能更加熟练、更加明白的使用Promise。
