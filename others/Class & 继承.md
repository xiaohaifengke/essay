# Class & 继承

## Class与es5中构造函数的区别

```js
Class A {}
Class B extend A {}

B.prototype.__proto__ === A.prototype // true
B.__proto__ === A  // true

Object.getPrototypeOf(B) === A // true
Object.getPrototypeOf(B.prototype) === A.prototype // true
```

1. 类的内部所有定义的方法，都是不可枚举的（non-enumerable）。ES5中是可枚举的。
2. 类必须使用`new`调用，否则会报错。这是它跟普通构造函数的一个主要区别，后者不用`new`也可以执行。
3. 为什么子类的构造函数，一定要调用`super()`？原因就在于 ES6 的继承机制，与 ES5 完全不同。ES5 的继承机制，是先创造一个独立的子类的实例对象，然后再将父类的方法添加到这个对象上面，即“实例在前，继承在后”。ES6 的继承机制，则是先将父类的属性和方法，加到一个空的对象上面，然后再将该对象作为子类的实例，即“继承在前，实例在后”。这就是为什么 ES6 的继承必须先调用`super()`方法，因为这一步会生成一个继承父类的`this`对象，没有这一步就无法继承父类。
4. ES5 中的原生构造函数是无法继承的。ES6 允许继承原生构造函数定义子类，因为 ES6 是先新建父类的实例对象`this`，然后再用子类的构造函数修饰`this`，使得父类的所有行为都可以继承。