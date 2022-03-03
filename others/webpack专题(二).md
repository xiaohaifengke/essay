# webpack专题（二）

## 1. 预备知识

- ### toStringTag

  `Symbol.toStringTag` 是一个内置 symbol，它通常作为对象的属性键使用，对应的属性值应该为字符串类型，这个字符串用来表示该对象的自定义类型标签，通常只有内置的 `Object.prototype.toString()` 方法会去读取这个标签并把它包含在自己的返回值里。

  ```js
  console.log(Object.prototype.toString.call('foo'));     // "[object String]"
  console.log(Object.prototype.toString.call([1, 2]));    // "[object Array]"
  console.log(Object.prototype.toString.call(3));         // "[object Number]"
  console.log(Object.prototype.toString.call(true));      // "[object Boolean]"
  console.log(Object.prototype.toString.call(undefined)); // "[object Undefined]"
  console.log(Object.prototype.toString.call(null));      // "[object Null]"
  let myExports={};
  Object.defineProperty(myExports, Symbol.toStringTag, { value: 'Module' });
  console.log(Object.prototype.toString.call(myExports));
  ```

- ### Object.create(null)

  使用`create`创建的对象，没有任何属性,把它当作一个非常纯净的map来使用，我们可以自己定义`hasOwnProperty`、`toString`方法,完全不必担心会将原型链上的同名方法覆盖掉

  在我们使用`for..in`循环的时候会遍历对象原型链上的属性(Object.keys只会返回对象自身的可枚举属性)，使用`create(null)`就不必再对属性进行检查了

  ```js
  var ns = Object.create(null);
  if (typeof Object.create !== "function") {
      Object.create = function (proto) {
          function F() {}
          F.prototype = proto;
          return new F();
      };
  }
  console.log(ns)
  console.log(Object.getPrototypeOf(ns));
  ```

- a

- a

- a

- 