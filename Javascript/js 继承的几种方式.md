# JavaScript 继承的几种方式

## 核心答案

JavaScript 的继承本质上是基于**原型（Prototype）**的。在 ES6 之前，继承是通过原型链和构造函数组合实现的；在 ES6 之后，引入了 `class` 关键字作为语法糖。

### 1. 原型链继承 (Prototype Chain Inheritance)

**实现**：将子类的原型指向父类的实例。

```javascript
function Parent() {
  this.name = "parent";
  this.list = [1, 2];
}
function Child() {}
Child.prototype = new Parent();
```

- **优点**：简单，子类实例能访问父类构造函数属性及原型属性。
- **缺点**：
  1. 引用类型的属性被所有子类实例**共享**（改一个全变）。
  2. 创建子类实例时，无法向父类构造函数传参。

---

### 2. 借用构造函数继承 (Constructor Inheritance)

**实现**：在子类构造函数中使用 `call` 或 `apply` 调用父类构造函数。

```javascript
function Child() {
  Parent.call(this, "args");
}
```

- **优点**：
  1. 解决了引用类型共享问题（每个实例都有自己的属性）。
  2. 可以向父类传参。
- **缺点**：无法继承父类原型上的方法（方法都在构造函数中定义，无法复用）。

---

### 3. 组合继承 (Combination Inheritance) —— **最常用**

**实现**：原型链继承（继承方法） + 借用构造函数（继承属性）。

```javascript
function Child(name) {
  Parent.call(this, name);
}
Child.prototype = new Parent();
Child.prototype.constructor = Child;
```

- **优点**：融合前两种优点，是 JS 中最常用的继承模式。
- **缺点**：由于执行了两次父类构造函数（一次在 `call`，一次在 `new`），导致子类原型上多了一份冗余的父类属性。

---

### 4. 原型式继承 (Prototypal Inheritance)

**实现**：利用一个空对象作为中介，将对象的原型指向现有对象。`Object.create()` 的模拟实现。

```javascript
function createObj(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}
```

- **缺点**：引用类型属性依然存在共享问题。

---

### 5. 寄生式继承 (Parasitic Inheritance)

**实现**：在原型式继承的基础上，增强对象（添加方法）。

```javascript
function createChild(obj) {
  let clone = Object.create(obj);
  clone.sayHi = function () {
    console.log("hi");
  };
  return clone;
}
```

- **缺点**：每次创建对象都会重新定义方法，无法函数复用。

---

### 6. 寄生组合式继承 (Parasitic Combination Inheritance) —— **最优解**

**实现**：通过借用构造函数继承属性，通过原型链的浅复制继承方法（不调用父类构造函数）。

```javascript
function Child(name) {
  Parent.call(this, name);
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```

- **优点**：只调用一次父类构造函数，避免了在 `Child.prototype` 上创建不必要的、多余的属性。是 ES6 之前最理想的继承方式。

---

### 7. ES6 Class 继承

**实现**：使用 `extends` 和 `super`。

```javascript
class Child extends Parent {
  constructor(name) {
    super(name);
  }
}
```

- **本质**：仍然是**寄生组合式继承**的语法糖。但有一些细节差异（如 `class` 继承会继承静态属性）。

---

## 面试官喜欢追问的细节

### 追问 1：ES5 继承和 ES6 继承有什么本质区别？

**答**：

1. **this 生成顺序**：
   - **ES5**：先创建子类的实例对象 `this`，然后再将父类的属性添加到 `this` 上（Parent.apply(this)）。
   - **ES6**：先从父类类创建实例对象 `this`（必须先调用 `super()`），然后再用子类的构造函数修改 `this`。
2. **静态属性**：ES6 的 `extends` 会建立子类构造函数与父类构造函数之间的原型链，从而实现静态方法的继承。

---

### 追问 2：为什么组合继承要调用两次父类构造函数？会有什么影响？

**答**：

- 第一次：`Child.prototype = new Parent()` 主要是为了获取父类原型上的方法。
- 第二次：`Parent.call(this)` 主要是为了在实例上创建独立的属性。
- **影响**：子类实例上会有 `name` 属性，子类的原型 `__proto__` 上也会有一个同名的 `name` 属性。这造成了内存浪费，虽然实例上的属性会遮蔽原型上的属性，但并不优雅。

---

### 追问 3：Object.create(null) 和 {} 有什么区别？

**答**：

- `Object.create(null)` 创建的对象是一个**纯净对象**，它没有原型（`__proto__` 为 null），因此没有 `toString`、`hasOwnProperty` 等 Object 原型方法。
- `{}` 等同于 `Object.create(Object.prototype)`，它继承了 Object 的所有原型方法。

---

### 追问 4：new 操作符具体做了什么？

**答**：

1. 创建一个全新的空对象。
2. 将该对象的原型（`__proto__`）指向映射构造函数的 `prototype`。
3. 将构造函数内部的 `this` 绑定到该新对象，并执行代码。
4. 如果函数没有返回对象，则返回这个新对象。

---

### 追问 5：如果构造函数返回一个对象，继承会受影响吗？

**答**：
是的。如果父类构造函数显式返回一个对象，那么子类通过 `call(this)` 调用时获取到的并不是 `this` 实例，而是父类返回的那个对象。这会导致子类实例无法正确获取父类定义的属性。
