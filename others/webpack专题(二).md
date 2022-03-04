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

## 2. 同步加载

### 2.1 实现 `require` 方法

1. 准备工作：webpack.config.js

   ```
   const path = require('path');
   const HtmlWebpackPlugin=require('html-webpack-plugin');
   module.exports = {
     mode:'development',
     devtool:"none",
     context: process.cwd(),
     entry: './src/index.js',
     output: {
       filename: 'bundle.js'
     },
     devServer:{
       contentBase:path.resolve(__dirname,'./dist')
     },
     module: {
       rules: [
         {
           test: /\.js$/,
           use: {
             loader: "babel-loader",
             options: {
               presets:["@babel/preset-env"]
             }
           },
           include: path.join(__dirname, "src"),
           exclude: /node_modules/
         }
       ]
     },
     plugins: []
   };
   ```

2. index.js

   ```js
   // src/index.js
   let title = require('./title.js');
   console.log(title);
   ```

3. title.js

   ```js
   // src/title.js
   module.exports = "title";
   ```

```js
(function(modules){
    var installedModules = {};
    function __webpack_require__(moduleId){
        if(installedModules[moduleId]){
            return installedModules[moduleId];
        }
        var module = installedModules[moduleId] = {
            i:moduleId,
            l:false,
            exports:{}
        }
        modules[moduleId].call(modules.exports,module,module.exports,__webpack_require__);
        module.l = true;
        return module.exports;
    }
    return __webpack_require__((__webpack_require__.s = "./src/index.js"));
})({
    "./src/index.js":function(module,exports,__webpack_require__){
        var title = __webpack_require__('./src/title.js');
        console.log(title);
    },
    "./src/title.js":function(module,exports){
       module.exports = "title";
    }
})
```

### 2.2 __webpack_require__.r

表示此对象是一个ES6模块对象

```js
//在导出对象上定义__esModule属性
  __webpack_require__.r = function(exports) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
  };
```

### 2.3 __webpack_require__.n

获取此对象的默认导出

```js
// getDefaultExport函数为了兼容那些非non-harmony模块
__webpack_require__.n = function(module) {
    var getter =
      module && module.__esModule
        ? function getDefault() {
            return module["default"];
          }
        : function getModuleExports() {
            return module;
          };
    __webpack_require__.d(getter, "a", getter);
    return getter;
  };
```

## 3. harmony

### 3.1 common.js加载 common.js

#### 3.1.1 index.js

```js
let title = require('./title');
console.log(title.name);
console.log(title.age);
```

#### 3.1.2 title.js

```js
exports.name = 'title_name';
exports.age = 'title_age';
```

#### 3.1.3 bundle.js

```js
{
"./src/index.js":
  (function(module, exports, __webpack_require__) {
    var title = __webpack_require__("./src/title.js");
    console.log(title.name);
    console.log(title.age);
  }),
"./src/title.js":
  (function(module, exports) {
    exports.name = 'title_name';
    exports.age = 'title_age';
  })
}
```

### 3.2 common.js加载 ES6 modules

![commes6](.\imgs\webpack\commes6.png)

#### 3.2.1 index.js

```js
let title = require('./title');
console.log(title);
console.log(title.default);
console.log(title.age);
```

#### 3.2.2 title.js

```js
export default name = 'title_name';
export const age = 'title_age';
```

#### 3.2.3 bundle.js

```js
{
    "./src/index.js":
      (function (module, exports, __webpack_require__) {
        var title = __webpack_require__(/*! ./title */ "./src/title.js");
        console.log(title.name);
        console.log(title.age);
      }),

    "./src/title.js":
      (function (module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.r(__webpack_exports__);
        /* harmony export (binding) */
        __webpack_require__.d(__webpack_exports__, "age", function () { return age; });
        /* harmony default export */
        __webpack_exports__["default"] = (name = 'title_name');
        var age = 'title_age';
      })
  }
```

### 3.3 ES6 modules 加载 ES6 modules

#### 3.3.1 index.js

```js
import name,{age} from './title';
console.log(name);
console.log(age);
```

#### 3.3.2 title.js

```js
export default name  = 'title_name';
export const age = 'title_age';
```

#### 3.3.3 bundle.js

```js
{

    "./src/index.js":
      (function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        var _title__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./title */ "./src/title.js");
        console.log(_title__WEBPACK_IMPORTED_MODULE_0__["default"]);
        console.log(_title__WEBPACK_IMPORTED_MODULE_0__["age"]);
      }),
    "./src/title.js":
      (function (module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, "age", function () { return age; });
        __webpack_exports__["default"] = (name = 'title_name');
        var age = 'title_age';
      })
  }
```

### 3.4 ES6 modules 加载 common.js

#### 3.4.1 index.js

```js
import home, { name, age } from './title';
console.log(name);
console.log(age);
console.log(home);
```

#### 3.4.2 title.js

```js
module.exports = { home: 'beijing' };
module.exports.name = 'title_name';
module.exports.age = 'title_age';
```

#### 3.4.3 bundle.js

```js
  {
    "./src/index.js":
      (function (module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.r(__webpack_exports__);
    /* harmony import */ var _title__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./title */ "./src/title.js");
    /* harmony import */ var _title__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_title__WEBPACK_IMPORTED_MODULE_0__);
        console.log(_title__WEBPACK_IMPORTED_MODULE_0__["name"]);
        console.log(_title__WEBPACK_IMPORTED_MODULE_0__["age"]);
        console.log(_title__WEBPACK_IMPORTED_MODULE_0___default.a);
      }),

    "./src/title.js":
      (function (module, exports) {
        module.exports = {
          home: 'beijing'
        };
        module.exports.name = 'title_name';
        module.exports.age = 'title_age';
      })
  }
```

## 4. 异步加载

### 4.1 源文件

#### 4.1.1 index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
</body>
</html>
```

#### 4.1.2 src\index.js

src\index.js

```js
let button = document.createElement("button");
button.innerHTML = "点我";
button.onclick = function () {
    import(/*webpackChunkName: 'title'*/'./title.js').then(function (result) {
        console.log(result, result.default);
    });
};
document.body.appendChild(button);
```

#### 4.1.3 src\title.js

src\title.js

```js
module.exports = {
    name: 'title'
}
module.exports.age = 10;
```

### 4.2 打包后的文件

#### 4.2.1

```js
(function (modules) { // 启动函数
  //安装一个为了加载额外代码块的JSON回调函数
  function webpackJsonpCallback(data) {
    var chunkIds = data[0];//代码块ID
    var moreModules = data[1];//更多的模块
    //向模块对象上增加更多的模块，然后把所有的chunkIds设置为已经加载并触发回调
    var moduleId, chunkId, i = 0, resolves = [];
    for (; i < chunkIds.length; i++) {
      chunkId = chunkIds[i];
      if (installedChunks[chunkId]) {
        resolves.push(installedChunks[chunkId][0]);
      }
      installedChunks[chunkId] = 0;//标识这个代码块为已经OK
    }
    for (moduleId in moreModules) {//把新拉下来的模块合并到模块对象上
      if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
        modules[moduleId] = moreModules[moduleId];
      }
    }
    if (parentJsonpFunction) parentJsonpFunction(data);//如果有父JSONP函数就调用

    while (resolves.length) {
      resolves.shift()();//让所有的promise都OK
    }
  };

  // 模块缓存
  var installedModules = {};

  //用来存放加载完成或加载中的代码块对象
  // undefined = 代码块未加载, null = 代码块正在预加载或者预获取
  // Promise = 代码块更在加载中, 0 = 代码块已经加载
  var installedChunks = {
    "main": 0
  };

  //JSON加载的路径
  function jsonpScriptSrc(chunkId) {
    return __webpack_require__.p + "" + chunkId + ".bundle.js"
  }

  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    module.l = true;
    return module.exports;
  }

  //这个文件只包含入口代码块
  //用来加载额外的代码块的函数
  __webpack_require__.e = function requireEnsure(chunkId) {
    var promises = [];
    //JSONP代码块加载
    var installedChunkData = installedChunks[chunkId];
    if (installedChunkData !== 0) { // 0的意思是已经安装
      // a Promise means "currently loading". 如果是一个Promise的话表示正在加载
      if (installedChunkData) {
        promises.push(installedChunkData[2]);//如果已经在加载中了，则添加Promise
      } else {
        //在代码块缓存中放置Promise
        var promise = new Promise(function (resolve, reject) {
          installedChunkData = installedChunks[chunkId] = [resolve, reject];
        });
        promises.push(installedChunkData[2] = promise);

        // 开始加载代码块
        var script = document.createElement('script');
        var onScriptComplete;

        script.charset = 'utf-8';
        script.timeout = 120;
        //// HTMLElement 接口的 nonce 属性返回只使用一次的加密数字，被内容安全政策用来决定这次请求是否被允许处理。
        if (__webpack_require__.nc) {
          script.setAttribute("nonce", __webpack_require__.nc);
        }
        //设置源文件路径
        script.src = jsonpScriptSrc(chunkId);

        //在栈展开之前创建错误以获取有用的堆栈信息
        var error = new Error();
        onScriptComplete = function (event) {
          script.onerror = script.onload = null;
          clearTimeout(timeout);
          var chunk = installedChunks[chunkId];
          if (chunk !== 0) {
            if (chunk) {
              var errorType = event && (event.type === 'load' ? 'missing' : event.type);
              var realSrc = event && event.target && event.target.src;
              error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
              error.name = 'ChunkLoadError';
              error.type = errorType;
              error.request = realSrc;
              chunk[1](error);
            }
            installedChunks[chunkId] = undefined;
          }
        };
        var timeout = setTimeout(function () {
          onScriptComplete({ type: 'timeout', target: script });
        }, 120000);
        script.onerror = script.onload = onScriptComplete;
        document.head.appendChild(script);
      }
    }
    return Promise.all(promises);
  };

  __webpack_require__.m = modules;

  __webpack_require__.c = installedModules;

  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, { enumerable: true, get: getter });
    }
  };

  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
  };

  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = __webpack_require__(value);
    if (mode & 8) return value;
    if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    var ns = Object.create(null);
    __webpack_require__.r(ns);
    Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    if (mode & 2 && typeof value != 'string') for (var key in value) __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));
    return ns;
  };

  __webpack_require__.n = function (module) {
    var getter = module && module.__esModule ?
      function getDefault() { return module['default']; } :
      function getModuleExports() { return module; };
    __webpack_require__.d(getter, 'a', getter);
    return getter;
  };

  __webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

  __webpack_require__.p = "";

  //异步加载中的错误处理函数
  __webpack_require__.oe = function (err) { console.error(err); throw err; };
  //刚开始的时候会把数组赋给window["webpackJsonp"],并且赋给jsonpArray
  var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
  //绑定push函数为oldJsonpFunction
  var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
  //狸猫换太子，把webpackJsonpCallback赋给了jsonpArray.push方法
  jsonpArray.push = webpackJsonpCallback;
  //把数组进行截取得到一个新的数组
  jsonpArray = jsonpArray.slice();
  //如果数组不为空，就把全部安装一次
  for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
  //把oldJsonpFunction赋给parentJsonpFunction
  var parentJsonpFunction = oldJsonpFunction;

  return __webpack_require__(__webpack_require__.s = "./src/index.js");
})
  ({

    "./src/index.js":
      (function (module, exports, __webpack_require__) {
        var button = document.createElement("button");
        button.innerHTML = "点我";
        button.onclick = function () {
          __webpack_require__.e("title").then(__webpack_require__.t.bind(null, "./src/title.js", 7)).then(function (result) {
            console.log(result["default"]);
          });
        };
        document.body.appendChild(button);
      })
  });
```

#### 4.2.2 title.bundle.js

dist\title.bundle.js

```js
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["title"], {
  "./src/title.js":
    (function (module, exports) {
      module.exports = {
        name: 'title'
      };
      module.exports.age = 10;
    })
}]);
```

### 4.3 实现bundle.js

```js
(function (modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        }
        modules[moduleId].call(modules.exports, module, module.exports, __webpack_require__);
        module.l = true;
        return module.exports;
    }
    var installedChunks = {
        "main": 0
    };

    function webpackJsonpCallback(data) {
        var chunkIds = data[0];//代码块ID
        var moreModules = data[1];//更多的模块
        var moduleId, chunkId, resolves = [];
        for (let i = 0; i < chunkIds.length; i++) {
            chunkId = chunkIds[i];
            resolves.push(installedChunks[chunkId][0]);
            installedChunks[chunkId] = 0;//标识这个代码块为已经OK
        }
        for (moduleId in moreModules) {//把新拉下来的模块合并到模块对象上
            modules[moduleId] = moreModules[moduleId];
        }
        while (resolves.length) {
            resolves.shift()();//让所有的promise都OK
        }
    }
    __webpack_require__.t = function (value) {
        value = __webpack_require__(value);
        var ns = Object.create(null);
        ns.default = value;
        return ns;
    };
    __webpack_require__.e = function (chunkId) {
        var promises = [];
        var installedChunkData = installedChunks[chunkId];
        if (installedChunkData !== 0) {
            var promise = new Promise(function (resolve, reject) {
                installedChunkData = installedChunks[chunkId] = [resolve, reject];
            });
            installedChunkData[2] = promise;
            promises.push(promise);
            var script = document.createElement('script');
            script.src = chunkId + ".bundle.js";
            document.head.appendChild(script);
        }
        return Promise.all(promises);
    }
    var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
    jsonpArray.push = webpackJsonpCallback;
    return __webpack_require__("./src/index.js");
})({
    "./src/index.js":
        (function (module, exports, __webpack_require__) {
            var button = document.createElement("button");
            button.innerHTML = "点我";
            button.onclick = function () {
                __webpack_require__.e("title").then(__webpack_require__.t.bind(null, "./src/title.js", 7)).then(function (result) {
                    console.log(result["default"]);
                });
            };
            document.body.appendChild(button);
        })
})
```