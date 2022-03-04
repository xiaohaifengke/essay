/* class TestA {
  type = "test";
  title: string;
  test: string
 
  constructor(t: string, a: number) {
    this.title = t;
    this.test = 'test oh'
  }
}

const testA = new TestA('TestA TestA', 2)
function reportableClassDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
  return TestA
}
 
@reportableClassDecorator
class BugReport {
  type = "report";
  title: string;
 
  constructor(t: string) {
    this.title = t;
  }
}

type B = typeof BugReport
 
const bug = new BugReport("Needs dark mode");
console.log(bug.title); // Prints "Needs dark mode"
console.log(bug.type); // Prints "report"
 */
/* 
  let temp
  class ExampleClass {
    @first()
    @second()
    method() {
        console.log('this is method');
    }
  }
  const exampleInstance = new ExampleClass()
  // console.log(temp === ExampleClass.prototype);
  
  // exampleInstance.method()
  // exampleInstance.method()
  function first() {
    console.log("first(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      console.log(target);
      temp = target
      console.log("first(): called");
    };
  }
   
  function second() {
    console.log("second(): factory evaluated");
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      console.log(target);
      
      console.log("second(): called");
    };
  } */

  /* const configurable1 = configurable(false)
  const configurable2 = configurable(false)
  class Point {
    private _x: number;
    private _y: number;
    constructor(x: number, y: number) {
      this._x = x;
      this._y = y;
    }
   
    @configurable1
    get x() {
      return this._x;
    }
   
    @configurable1
    set x(a:number) {
      this._x = a
    }
   
    @configurable(false)
    get y() {
      return this._y;
    }
  }

  function configurable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      descriptor.configurable = value;
    };
  } */

/*   function f(key: string): any {
    console.log("evaluate: ", key);
    return function () {
      console.log("call: ", key);
    };
  }
  
  @f("Class Decorator")
  class C {
  
    @f("Static Method")
    static method(@f("Static Method Parameter") foo) {}

    @f("Static Property")
    static prop?: number;
  
    constructor(@f("Constructor Parameter") foo) {}
  
    @f("Instance Property")
    prop?: number;
  
    @f("Instance Method")
    method(@f("Instance Method Parameter") foo) {}
  } */

/*   function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  function observable(target: any, key: string): any {
    // prop -> onPropChange
    const targetKey = "on" + capitalizeFirstLetter(key) + "Change";
  
    target[targetKey] =
      function (fn: (prev: any, next: any) => void) {
        let prev = this[key];
        Reflect.defineProperty(this, key, {
          set(next) {
            fn(prev, next);
            prev = next;
          }
        })
      };
  }
  
  class C {
    @observable
    foo = -1;
  
    @observable
    bar = "bar";
  }
  
  const c = new C();
  
  c.onFooChange((prev, next) => console.log(`prev: ${prev}, next: ${next}`))
  c.onBarChange((prev, next) => console.log(`prev: ${prev}, next: ${next}`))
  
  c.foo = 100; // -> prev: -1, next: 100
  c.foo = -3.14; // -> prev: 100, next: -3.14
  c.bar = "baz"; // -> prev: bar, next: baz
  c.bar = "sing"; // -> prev: baz, next: sing */

  function immutable(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.set;
    console.log('immutable');
    
    descriptor.set = function (value: any) {
      return original.call(this, { ...value })
    }
  }
  
  class C {
    private _point = { x: 0, y: 0 }
  
    @immutable
    set point(value: { x: number, y: number }) {
      this._point = value;
    }
  
    get point() {
      return this._point;
    }
  }
  
  const c = new C();
  const point = { x: 1, y: 1 }
  c.point = point;
  
  console.log(c.point === point)
  // -> false