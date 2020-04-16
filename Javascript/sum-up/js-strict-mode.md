# strict mode


严格模式代码和非严格模式代码可以共存，因此项目脚本可以渐进式地采用严格模式。
严格模式对正常的 JavaScript语义做了一些更改。

1. 严格模式通过抛出错误来消除了一些原有静默错误。
2. 严格模式修复了一些导致 JavaScript引擎难以执行优化的缺陷：有时候，相同的代码，严格模式可以比非严格模式下运行得更快。
3. 严格模式禁用了在ECMAScript的未来版本中可能会定义的一些语法。

## 开启严格模式

为整个脚本文件开启严格模式，需要在所有语句之前放一个特定语句 "use strict"; （或 'use strict';）
> 建议按一个个函数去开启严格模式

## 严格模式中的变化

1. 严格模式下无法再意外创建全局变量。严格模式中意外创建全局变量被抛出错误替代.
2. 严格模式会使引起静默失败(silently fail,注:不报错也没有任何效果)的赋值操作抛出异常。
    例如, NaN 是一个不可写的全局变量。 在正常模式下, 给 NaN 赋值不会产生任何作用; 开发者也不会受到任何错误反馈。
    但在严格模式下, 给 NaN 赋值会抛出一个异常。 任何在正常模式下引起静默失败的赋值操作 (给不可写属性赋值, 给只读属性(getter-only)赋值,
    给不可扩展对象(non-extensible object)的新属性赋值) 都会抛出异常。
    
3. 在严格模式下, 试图删除不可删除的属性时会抛出异常(之前这种操作不会产生任何效果)。
4.  严格模式要求函数的参数名唯一。
5.  ECMAScript 6中的严格模式禁止设置primitive值的属性.不采用严格模式,设置属性将会简单忽略(no-op),采用严格模式,将抛出TypeError错误。
    ```javascript
    (function() {
      "use strict";
    
      false.true = "";              //TypeError
      (14).sailing = "home";        //TypeError
      "with".you = "far away";      //TypeError
    })();
    ```
    
6. 严格模式禁止删除声明变量。delete name 在严格模式下会引起语法错误。

7. 名称 eval 和 arguments 不能通过程序语法被绑定(be bound)或赋值。以下的所有尝试将引起语法错误:
    ```javascript
    "use strict";
    eval = 17;
    arguments++;
    ++eval;
    var obj = { set p(arguments) { } };
    var eval;
    try { } catch (arguments) { }
    function x(eval) { }
    function arguments() { }
    var y = function eval() { };
    var f = new Function("arguments", "'use strict'; return 17;");
    ```
    
8. 严格模式下，参数的值不会随 arguments 对象的值的改变而变化。

    在正常模式下，对于第一个参数是 arg 的函数，对 arg 赋值时会同时赋值给 arguments[0]，反之亦然（除非没有参数，或者 arguments[0] 被删除）。
    严格模式下，函数的 arguments 对象会保存函数被调用时的原始参数。
    arguments[i] 的值不会随与之相应的参数的值的改变而变化，同名参数的值也不会随与之相应的 arguments[i] 的值的改变而变化。
    ```javascript
    function f(a) {
      "use strict";
      a = 42;
      return [a, arguments[0]];
    }
    var pair = f(17);
    console.assert(pair[0] === 42);
    console.assert(pair[1] === 17);
    ```

9. 不再支持 arguments.callee。

    正常模式下，arguments.callee 指向当前正在执行的函数。这个作用很小：直接给执行函数命名就可以了！
    此外，arguments.callee 十分不利于优化，例如内联函数，因为 arguments.callee 会依赖对非内联函数的引用。
    在严格模式下，arguments.callee 是一个不可删除属性，而且赋值和读取时都会抛出异常：
    ```javascript
    "use strict";
    var f = function() { return arguments.callee; };
    f(); // 抛出类型错误
    ```
    
10. 在严格模式下通过this传递给一个函数的值不会被强制转换为一个对象。

    对一个普通的函数来说，this总会是一个对象：不管调用时this它本来就是一个对象；
    还是用布尔值，字符串或者数字调用函数时函数里面被封装成对象的this；
    还是使用undefined或者null调用函数式this代表的全局对象（使用call, apply或者bind方法来指定一个确定的this）。
    这种自动转化为对象的过程不仅是一种性能上的损耗，同时在浏览器中暴露出全局对象也会成为安全隐患，
    因为全局对象提供了访问那些所谓安全的JavaScript环境必须限制的功能的途径。
    所以对于一个开启严格模式的函数，指定的this不再被封装为对象，而且如果没有指定this的话它值是undefined：
    

## 为未来的ECMAScript版本铺平道路

1. 在严格模式中一部分字符变成了保留的关键字。

    这些字符包括implements, interface, let, package, private, protected, public, static和yield。
    在严格模式下，你不能再用这些名字作为变量名或者形参名。
    
2. 严格模式禁止了不在脚本或者函数层面上的函数声明。

    在浏览器的普通代码中，在“所有地方”的函数声明都是合法的。这并不在ES5规范中（甚至是ES3）！这是一种针对不同浏览器中不同语义的一种延伸。
    未来的ECMAScript版本很有希望制定一个新的，针对不在脚本或者函数层面进行函数声明的语法。
    在严格模式下禁止这样的函数声明对于将来ECMAScript版本的推出扫清了障碍：
    ```javascript
    "use strict";
    if (true) {
      function f() { } // !!! 语法错误
      f();
    }
    
    for (var i = 0; i < 5; i++) {
      function f2() { } // !!! 语法错误
      f2();
    }
    
    function baz() { // 合法
      function eit() { } // 同样合法
    }
    ```
    这种禁止放到严格模式中并不是很合适，因为这样的函数声明方式从ES5中延伸出来的。但这是ECMAScript委员会推荐的做法，浏览器就实现了这一点。
