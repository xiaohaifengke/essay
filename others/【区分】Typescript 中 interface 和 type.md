# 【区分】Typescript 中 interface 和 type

> [转](https://www.cnblogs.com/EnSnail/p/11233592.html)
> 在接触 ts 相关代码的过程中，总能看到 interface 和 type 的身影。只记得，曾经遇到 type 时不懂查阅过，记得他们很像，相同的功能用哪一个都可以实现。但最近总看到他们，就想深入的了解一下他们。

### interface：接口



TypeScript 的核心原则之一是对值所具有的结构进行类型检查。 而接口的作用就是为这些类型命名和为你的代码或第三方代码定义契约。

```typescript
interface LabelledValue {
  label: string;
}

function printLabel(labelledObj: LabelledValue) {
  console.log(labelledObj.label);
}

let myObj = {size: 10, label: "Size 10 Object"};
printLabel(myObj);
```

接口就好比一个名字，用来描述上面例子里的要求。

接口具有的特性：

- 可选属性

```csharp
interface SquareConfig {
  color?: string;
}
```

- 只读属性

```typescript
interface Point {
    readonly x: number;
}
```

- 多余属性检查，防止使用不属于接口的属性

```typescript
interface Preson {
    name: string;
    age?: number;
}

let p1:Person = {name: '小明'} // 正确
let p2:Person = {name: '小明', age: 18, sex: '男'}; // 报错

// 绕过：多余属性不报错
// 方式1 
let p = {name: '小明', age: 18, sex: '男'};
let p3 = p;

// 方式2
interface Preson {
    name: string;
    age?: number;
    [propName: string]: any
}
let p4 = {name: '小明', age: 18, sex: '男'};
```

- 函数类型

```php
interface SearchFunc {
  (source: string, subString: string): boolean;
}
```

- 索引类型: 针对数组

```csharp
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];
```

- 类类型

  - 类实现接口

  ```typescript
  interface ClockInterface {
    currentTime: Date;
    setTime(d: Date);
  }
  
  class Clock implements ClockInterface {
    currentTime: Date;
    setTime(d: Date) {
        this.currentTime = d;
    }
    constructor(h: number, m: number) { }
  }
  ```

  - 接口继承接口，可多个

  ```typescript
  interface Shape {
  color: string;
  }
  
  interface PenStroke {
      penWidth: number;
  }
  
  interface Square extends Shape, PenStroke {
      sideLength: number;
  }
  
  let square = <Square>{};
  square.color = "blue";
  square.sideLength = 10;
  square.penWidth = 5.0;
  ```

### type：类型别名



type 会给一个类型起个新名字。 type 有时和 interface 很像，但是可以作用于原始值（基本类型），联合类型，元组以及其它任何你需要手写的类型。

举例：

```typescript
type Name = string; // 基本类型
type NameResolver = () => string; // 函数
type NameOrResolver = Name | NameResolver; // 联合类型

function getName(n: NameOrResolver): Name {
    if (typeof n === 'string') {
        return n;
    } else {
        return n();
    }
}
```

起别名不会新建一个类型 - 它创建了一个新 名字来引用那个类型。给基本类型起别名通常没什么用，尽管可以做为文档的一种形式使用。

同接口一样，类型别名也可以是泛型 - 我们可以添加类型参数并且在别名声明的右侧传入：

```haskell
type Container<T> = { value: T };
```

也可以使用类型别名来在属性里引用自己：

```haskell
type Tree<T> = {
    value: T;
    left: Tree<T>;
    right: Tree<T>;
}
```

与交叉类型一起使用，我们可以创建出一些十分稀奇古怪的类型。

```delphi
type LinkedList<T> = T & { next: LinkedList<T> };

interface Person {
    name: string;
}

var people: LinkedList<Person>;
var s = people.name;
var s = people.next.name;
var s = people.next.next.name;
var s = people.next.next.next.name;
```

然而，类型别名不能出现在声明右侧的任何地方。

```typescript
type Yikes = Array<Yikes>; // error
```

### interface vs type



#### 1. Objects / Functions

两者都可以用来描述对象或函数的类型，但是语法不同。

Interface

```typescript
interface Point {
  x: number;
  y: number;
}

interface SetPoint {
  (x: number, y: number): void;
}
```

Type alias

```typescript
type Point = {
  x: number;
  y: number;
};

type SetPoint = (x: number, y: number) => void;
```

#### 2. Other Types

与接口不同，类型别名还可以用于其他类型，如基本类型（原始值）、联合类型、元组。

```typescript
// primitive
type Name = string;

// object
type PartialPointX = { x: number; };
type PartialPointY = { y: number; };

// union
type PartialPoint = PartialPointX | PartialPointY;

// tuple
type Data = [number, string];

// dom
let div = document.createElement('div');
type B = typeof div;
```

#### 3. Extend

两者都可以扩展，但是语法又有所不同。此外，请注意接口和类型别名不是互斥的。接口可以扩展类型别名，反之亦然。

Interface extends interface

```typescript
interface PartialPointX { x: number; }
interface Point extends PartialPointX { y: number; }
```

Type alias extends type alias

```haskell
type PartialPointX = { x: number; };
type Point = PartialPointX & { y: number; };
```

Interface extends type alias

```typescript
type PartialPointX = { x: number; };
interface Point extends PartialPointX { y: number; }
```

Type alias extends interface

```typescript
interface PartialPointX { x: number; }
type Point = PartialPointX & { y: number; };
```

#### 4. class Implements

类可以以相同的方式实现接口或类型别名。但是请注意，类和接口被认为是静态的。因此，它们不能实现/扩展命名联合类型的类型别名。

```typescript
interface Point {
  x: number;
  y: number;
}

class SomePoint implements Point {
  x: 1;
  y: 2;
}

type Point2 = {
  x: number;
  y: number;
};

class SomePoint2 implements Point2 {
  x: 1;
  y: 2;
}

type PartialPoint = { x: number; } | { y: number; };

// FIXME: can not implement a union type
class SomePartialPoint implements PartialPoint {
  x: 1;
  y: 2;
}
```

#### 5. extends class

类定义会创建两个东西：类的实例类型和一个构造函数。 因为类可以创建出类型，所以你能够在允许使用接口的地方使用类。

```typescript
class Point {
    x: number;
    y: number;
}

interface Point3d extends Point {
    z: number;
}
```

#### 6. Declaration merging

与类型别名不同，接口可以定义多次，并将被视为单个接口(合并所有声明的成员)。

```typescript
// These two declarations become:
// interface Point { x: number; y: number; }
interface Point { x: number; }
interface Point { y: number; }

const point: Point = { x: 1, y: 2 };
```

#### 7. 计算属性，生成映射类型

type 能使用 in 关键字生成映射类型，但 interface 不行。

语法与索引签名的语法类型，内部使用了 for .. in。 具有三个部分：

- 类型变量 K，它会依次绑定到每个属性。
- 字符串字面量联合的 Keys，它包含了要迭代的属性名的集合。
- 属性的结果类型。

```go
type Keys = "firstname" | "surname"

type DudeType = {
  [key in Keys]: string
}

const test: DudeType = {
  firstname: "Pawel",
  surname: "Grzybek"
}

// 报错
//interface DudeType2 {
//  [key in keys]: string
//}
```

#### 7. 其他细节

```typescript
export default interface Config {
  name: string
}

// export default type Config1 = {
//   name: string
// }
// 会报错

type Config2 = {
    name: string
}
export default Config2
```

#### 总结

interface 和 type 很像，很多场景，两者都能使用。但也有细微的差别：

- 类型：对象、函数两者都适用，但是 type 可以用于基础类型、联合类型、元祖。
- 同名合并：interface 支持，type 不支持。
- 计算属性：type 支持, interface 不支持。

总的来说，公共的用 interface 实现，不能用 interface 实现的再用 type 实现。主要是一个项目最好保持一致。

参考：

- 中文文档的[接口](https://www.tslang.cn/docs/handbook/interfaces.html)
- 中文文档的[高级类型](https://www.tslang.cn/docs/handbook/advanced-types.html)
- 中文文档的[声明合并](https://www.tslang.cn/docs/handbook/declaration-merging.html)
- [Typescript: Interfaces vs Types](https://stackoverflow.com/questions/37233735/typescript-interfaces-vs-types)
- [TYPESCRIPT INTERFACE VS. TYPE](https://pawelgrzybek.com/typescript-interface-vs-type/)