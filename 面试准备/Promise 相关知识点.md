# Promise 相关知识点

## 回答

我一般会先这样回答：

- Promise 本质上是 JavaScript 里处理异步结果的一种统一抽象，它主要解决的是回调地狱、异步流程难串联、错误不好统一处理的问题。
- 面试里最常问的第一组，是它的三种状态：`pending`、`fulfilled`、`rejected`，以及为什么状态一旦确定就不能再改。
- 第二组是链式调用，也就是 `then`、`catch`、`finally` 怎么串起来，为什么 `then` 会返回一个新的 Promise，以及错误为什么可以一直向后冒泡。
- 第三组是执行时机。很多人只记得 Promise 是异步的，但更准确地说是：Promise 构造函数里的执行器会同步执行，`then/catch` 里的回调通常会进微任务队列。
- 第四组是常见静态方法，比如 `Promise.all`、`Promise.race`、`Promise.allSettled`、`Promise.any`，这些题一般会连着问并发控制和失败策略。
- 第五组是值穿透和手写题，尤其是 `then` 传非函数为什么还能继续往后传值，以及 `Promise.all`、`allSettled`、`race`、`any` 的实现思路，这部分很能区分“只是会用”还是“真的理解 Promise 机制”。
- 第六组是 Promise 和 `async/await` 的关系，因为 `async/await` 本质上是 Promise 的语法糖，底层模型并没有变。
- 所以我通常会总结成一句话：**Promise 不是单纯“把异步写得更好看”，它更核心的价值是统一异步状态、链式编排、错误处理和异步能力组合。**

## 面试官追问

### 追问 1：Promise 有哪几种状态？为什么状态不能逆转？

Promise 只有三种状态：`pending`、`fulfilled`、`rejected`。
一旦从 `pending` 变成成功或失败，就不会再变，这样异步结果才是稳定可推理的，不会出现回调执行到一半结果又被改掉的情况。

### 追问 2：为什么 `then` 会返回一个新的 Promise？

因为这样才能支持链式调用，把上一步的返回值或异常传给下一步。
如果 `then` 不返回新 Promise，就很难把“上一步的异步结果”继续往后编排，也没法自然地做错误冒泡和异步扁平化。

### 追问 3：Promise 和 `setTimeout` 的执行顺序为什么经常不一样？

因为 `Promise.then` 的回调通常属于微任务，而 `setTimeout` 属于宏任务。
当前同步代码执行完后，会先清空微任务，再进入下一轮宏任务，所以很多场景下 `Promise.then` 会先执行。

### 追问 4：`Promise.all`、`allSettled`、`race`、`any` 有什么区别？

`Promise.all` 适合“全部都成功才继续”，有一个失败就整体失败。
`Promise.allSettled` 不管成功失败都会等所有任务结束，适合拿完整结果。`Promise.race` 看谁先结束就用谁的结果，`Promise.any` 则是谁先成功就返回谁，只有全失败才会报错。

### 追问 5：什么是 Promise 的值穿透？

值穿透本质上是：`then` 或 `catch` 里如果传入的不是函数，这个处理器会被忽略，前一个 Promise 的值或错误会继续往后传。
所以成功态默认相当于 `value => value`，失败态默认相当于 `reason => { throw reason }`。
这就是为什么有些链式调用里中间写了 `then(123)` 或 `then(null)`，值仍然能继续传下去。

一个很常见的例子是：

```js
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then((value) => console.log(value)); // 1
```

如果从手写 `then` 的角度看，核心其实就是这两行默认值：

```js
onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason; };
```

### 追问 6：`Promise.all` 怎么手写？

核心点有 4 个：先用 `Promise.resolve` 统一包一层、结果要按原顺序收集、全部成功才 `resolve`、只要一个失败就立刻 `reject`。
一个面试里够用的简版可以这样写：

```js
Promise.myAll = function (iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);

    if (items.length === 0) {
      resolve([]);
      return;
    }

    const results = new Array(items.length);
    let fulfilledCount = 0;

    items.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          results[index] = value;
          fulfilledCount += 1;

          if (fulfilledCount === items.length) {
            resolve(results);
          }
        },
        reject,
      );
    });
  });
};
```

### 追问 7：`Promise.allSettled` 怎么手写？

它和 `all` 最大的区别是：不管成功还是失败都要收集结果，而且一定要等全部结束后再统一返回。
所以它不会因为某一个失败就提前中断。

```js
Promise.myAllSettled = function (iterable) {
  return new Promise((resolve) => {
    const items = Array.from(iterable);

    if (items.length === 0) {
      resolve([]);
      return;
    }

    const results = new Array(items.length);
    let settledCount = 0;

    const checkDone = () => {
      settledCount += 1;
      if (settledCount === items.length) {
        resolve(results);
      }
    };

    items.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          results[index] = { status: 'fulfilled', value };
          checkDone();
        },
        (reason) => {
          results[index] = { status: 'rejected', reason };
          checkDone();
        },
      );
    });
  });
};
```

### 追问 8：`Promise.race` 怎么手写？

它的核心最简单：谁先落定就用谁的结果，不管是成功还是失败。
所以实现上几乎就是给每个 Promise 都挂同一个 `resolve/reject`。

```js
Promise.myRace = function (iterable) {
  return new Promise((resolve, reject) => {
    for (const item of iterable) {
      Promise.resolve(item).then(resolve, reject);
    }
  });
};
```

补一句细节：如果传入的是空 iterable，这个 Promise 会一直保持 `pending`。

### 追问 9：`Promise.any` 怎么手写？

`any` 和 `race` 不一样，它不是“谁先结束就用谁”，而是“谁先成功就用谁”。
所以只有在所有 Promise 都失败时，它才会整体失败。

```js
Promise.myAny = function (iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);

    if (items.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    const errors = new Array(items.length);
    let rejectedCount = 0;

    items.forEach((item, index) => {
      Promise.resolve(item).then(
        resolve,
        (reason) => {
          errors[index] = reason;
          rejectedCount += 1;

          if (rejectedCount === items.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        },
      );
    });
  });
};
```

面试里如果对方不纠结标准细节，你也可以先说核心思路：收集所有失败原因，只有全失败才 reject。

### 追问 10：Promise 的错误处理为什么更容易统一？

因为链式调用里，前面任何一步抛错或者返回 reject，后面都可以在一个 `catch` 里集中处理。
这比多层回调里每层都自己判断错误更清晰，也更容易维护。

### 追问 11：`async/await` 和 Promise 到底是什么关系？

`async/await` 本质上就是 Promise 的语法糖，让异步代码写起来更像同步流程。
但底层还是 Promise：`async` 函数返回的仍然是 Promise，`await` 等的也是 Promise 或 thenable。

### 追问 12：手写 Promise 时最核心的点是什么？

面试里如果问手写，最核心通常不是把每个边界都背下来，而是答出三点：状态管理、回调队列、链式返回。
也就是 `pending` 只能落定一次，异步回调要缓存并在状态确定后执行，`then` 还要返回一个新 Promise 去接住返回值或异常。

## 可举的项目例子

如果面试官让我结合项目讲，我一般会这么说：

- 我在项目里比较常用 Promise 的地方，一个是并发请求聚合，一个是异步流程串联。
- 比如页面初始化要同时请求多个接口时，我们会用 `Promise.all` 或 `allSettled` 去统一处理，避免多层回调嵌套，也方便统一控制 loading 和错误提示。
- 另外像“先拿用户信息，再根据用户信息拉权限，再根据权限拉页面数据”这种链式场景，用 Promise 或 `async/await` 会比回调写法更清楚，异常处理也能集中收口。
- 如果面试官继续深挖手写题，我一般会补一句：这些静态方法本质上都离不开 `Promise.resolve` 包装、状态统计、结果收集和最终落定时机控制。
- 所以 Promise 在工程里的价值，不只是代码好看，而是让异步流程更可组合、更可维护。

## 易踩坑

- 不要把 Promise 说成“让异步变同步”，它只是让异步流程更好组织，不会改变 JS 单线程本质。
- 不要只记住 `then` 和 `catch` 的写法，却说不清状态流转、链式调用和错误冒泡。
- 不要把“Promise 是异步的”一句话说死，执行器是同步执行的，异步的是后续回调调度。
- 不要把值穿透理解成“Promise 会跳过所有中间 then”，更准确地说是：非函数处理器会被忽略，所以值或错误继续往后传。
- 不要混淆 `Promise.all` 和 `Promise.allSettled` 的语义，一个强调全成功，一个强调拿全结果。
- 不要忽略空 iterable 的边界：`all` 和 `allSettled` 会立即成功，`race` 会一直 pending，`any` 会立即 rejected。
- 不要把 `async/await` 和 Promise 当成两套完全不同的机制，前者本质上还是基于后者。
