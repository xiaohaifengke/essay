# webpack

## 1. 什么是WebPack

WebPack可以看做是模块打包机：它做的事情是，分析你的项目结构，找到JavaScript模块以及其它的一些浏览器不能直接运行的拓展语言（Scss，TypeScript等），并将其打包为合适的格式以供浏览器使用。

构建就是把源代码转换成发布到线上的可执行 JavaScrip、CSS、HTML 代码，包括如下内容。

- 代码转换：TypeScript 编译成 JavaScript、SCSS 编译成 CSS 等。
- 文件优化：压缩 JavaScript、CSS、HTML 代码，压缩合并图片等。
- 代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。
- 模块合并：在采用模块化的项目里会有很多个模块和文件，需要构建功能把模块分类合并成一个文件。
- 自动刷新：监听本地源代码的变化，自动重新构建、刷新浏览器。
- 代码校验：在代码被提交到仓库前需要校验代码是否符合规范，以及单元测试是否通过。
- 自动发布：更新完代码后，自动构建出线上发布代码并传输给发布系统。

构建其实是工程化、自动化思想在前端开发中的体现，把一系列流程用代码去实现，让代码自动化地执行这一系列复杂的流程。 构建给前端开发注入了更大的活力，解放了我们的生产力。

## 2. webpack核心概念

- Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
- Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
- Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。
- Loader：模块转换器，用于把模块原内容按照需求转换成新内容。
- Plugin：扩展插件，在 Webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。
- Output：输出结果，在 Webpack 经过一系列处理并得出最终想要的代码后输出结果。
- context: context即是项目打包的路径上下文，如果指定了context,那么entry和output都是相对于上下文路径的，contex必须是一个绝对路径

> Webpack 启动后会从`Entry`里配置的`Module`开始递归解析 Entry 依赖的所有 Module。 每找到一个 Module， 就会根据配置的`Loader`去找出对应的转换规则，对 Module 进行转换后，再解析出当前 Module 依赖的 Module。 这些模块会以 Entry 为单位进行分组，一个 Entry 和其所有依赖的 Module 被分到一个组也就是一个 `Chunk`。最后 Webpack 会把所有 Chunk 转换成文件输出。 在整个流程中 Webpack 会在恰当的时机执行 Plugin 里定义的逻辑。

webpack.config.js

```js
const path=require('path');
module.exports={
  context:process.cwd(),
  entry: './src/index.js',
  output: {
      path: path.resolve(__dirname,'dist'),
      filename:'bundle.js'
  },
  module: {},
  plugins: [],
  devServer: {}
}
```

## 3. loader的写法

### 3.1 什么是Loader

通过使用不同的Loader，Webpack可以要把不同的文件都转成JS文件,比如CSS、ES6/7、JSX等

- test：匹配处理文件的扩展名的正则表达式
- use：loader名称，就是你要使用模块的名称
- include/exclude:手动指定必须处理的文件夹或屏蔽不需要处理的文件夹
- query：为loaders提供额外的设置选项

### 3.2 loader三种写法

```js
    module: {
        rules: [
            {
                test: /\.css/,
                include: path.resolve(__dirname,'src'),
                exclude: /node_modules/,
                use: [{
                    loader: 'style-loader',
                    options: {
                        insert:'top'
                    }
                },'css-loader']
            }
        ]
    }
```

## 4. 插件

- 在 webpack 的构建流程中，plugin 用于处理更多其他的一些构建任务
- 模块代码转换的工作由 loader 来处理，除此之外的其他任何工作都可以交由 plugin 来完成

## 5. 文件指纹

- 打包后输出的文件名和后缀
- hash一般是结合CDN缓存来使用，通过webpack构建之后，生成对应文件名自动带上对应的MD5值。如果文件内容改变的话，那么对应文件哈希值也会改变，对应的HTML引用的URL地址也会改变，触发CDN服务器从源服务器上拉取对应数据，进而更新本地缓存。

### 5.1 文件指纹如何生成

- Hash 是整个项目的hash值，其根据每次编译内容计算得到，每次编译之后都会生成新的hash,即修改任何文件都会导致所有文件的hash发生改变，在一个项目中虽然入口不同，但是hash是相同的，hash无法实现前端静态资源的浏览器长缓存，如果有这个需求应该使用chunkhash
- chunkhash 采用hash计算的话，每一次构建后生成的哈希值都不一样，即使文件内容压根没有改变。这样子是没办法实现缓存效果，我们需要换另一种哈希值计算方式，即chunkhash,chunkhash和hash不一样，它根据不同的入口文件(Entry)进行依赖文件解析、构建对应的chunk，生成对应的哈希值。我们在生产环境里把一些公共库和程序入口文件区分开，单独打包构建，接着我们采用chunkhash的方式生成哈希值，那么只要我们不改动公共库的代码，就可以保证其哈希值不会受影响
- contenthash 使用chunkhash存在一个问题，就是当在一个JS文件中引入CSS文件，编译后它们的hash是相同的，而且只要js文件发生改变 ，关联的css文件hash也会改变,这个时候可以使用`mini-css-extract-plugin`里的`contenthash`值，保证即使css文件所处的模块里就算其他文件内容改变，只要css文件内容不变，那么不会重复构建

指纹占位符

| 占位符名称  | 含义                         |
| :---------- | :--------------------------- |
| ext         | 资源后缀名                   |
| name        | 文件名称                     |
| path        | 文件的相对路径               |
| folder      | 文件所在的文件夹             |
| contenthash | 文件的内容hash,默认是md5生成 |
| hash        | 文件内容的hash,默认是md5生成 |
| emoji       | 一个随机的指代文件内容的emoj |

## 6. 如何调试打包后的代码之sourcemap

- sourcemap是为了解决开发代码与实际运行代码不一致时帮助我们debug到原始开发代码的技术

- webpack通过配置可以自动给我们`source maps`文件，`map`文件是一种对应编译文件和源文件的方法
- [whyeval](https://github.com/webpack/docs/wiki/build-performance#sourcemaps)
- [source-map](https://github.com/mozilla/source-map)
- [javascript_source_map算法](http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)

| 类型                         | 含义                                                         |
| :--------------------------- | :----------------------------------------------------------- |
| source-map                   | 原始代码 最好的sourcemap质量有完整的结果，但是会很慢         |
| eval-source-map              | 原始代码 同样道理，但是最高的质量和最低的性能                |
| cheap-module-eval-source-map | 原始代码（只有行内） 同样道理，但是更高的质量和更低的性能    |
| cheap-eval-source-map        | 转换代码（行内） 每个模块被eval执行，并且sourcemap作为eval的一个dataurl |
| eval                         | 生成代码 每个模块都被eval执行，并且存在@sourceURL,带eval的构建模式能cache SourceMap |
| cheap-source-map             | 转换代码（行内） 生成的sourcemap没有列映射，从loaders生成的sourcemap没有被使用 |
| cheap-module-source-map      | 原始代码（只有行内） 与上面一样除了每行特点的从loader中进行映射 |

看似配置项很多， 其实只是五个关键字eval、source-map、cheap、module和inline的任意组合

| 关键字     | 含义                                                         |
| :--------- | :----------------------------------------------------------- |
| eval       | 使用eval包裹模块代码                                         |
| source-map | 产生.map文件                                                 |
| cheap      | 不包含列信息（关于列信息的解释下面会有详细介绍)也不包含loader的sourcemap |
| module     | 包含loader的sourcemap（比如jsx to js ，babel的sourcemap）,否则无法定义源文件 |
| inline     | 将.map作为DataURI嵌入，不单独生成.map文件                    |

- eval eval执行
- eval-source-map 生成sourcemap
- cheap-module-eval-source-map 不包含列
- cheap-eval-source-map 无法看到真正的源码

### 6.1 sourcemap

- [compiler官方下载](https://developers.google.com/closure/compiler)
- [compiler珠峰镜像](http://img.zhufengpeixun.cn/compiler.jar)

### 6.2 生成sourcemap

script.js

```js
let a=1;
let b=2;
let c=3;
java -jar compiler.jar --js script.js --create_source_map ./script-min.js.map --source_map_format=V3 --js_output_file script-min.js
```

script-min.js

```js
var a=1,b=2,c=3;
```

script-min.js.map

```js
{
"version":3,
"file":"script-min.js",
"lineCount":1,
"mappings":"AAAA,IAAIA,EAAE,CAAN,CACIC,EAAE,CADN,CAEIC,EAAE;",
"sources":["script.js"],
"names":["a","b","c"]
}
```

| 字段                   | 含义                                                         |
| :--------------------- | :----------------------------------------------------------- |
| version：Source        | Source map的版本，目前为3                                    |
| file：转换后的文件名。 | 转换后的文件名                                               |
| sourceRoot             | 转换前的文件所在的目录。如果与转换前的文件在同一目录，该项为空。 |
| sources                | 转换前的文件。该项是一个数组，表示可能存在多个文件合并。     |
| names                  | 转换前的所有变量名和属性名                                   |
| mappings               | 记录位置信息的字符串                                         |

### 6.3 mappings属性

- 关键就是map文件的mappings属性。这是一个很长的字符串，它分成三层

| 对应             | 含义                                                         |
| :--------------- | :----------------------------------------------------------- |
| 第一层是行对应   | 以分号（;）表示，每个分号对应转换后源码的一行。所以，第一个分号前的内容，就对应源码的第一行，以此类推。 |
| 第二层是位置对应 | 以逗号（,）表示，每个逗号对应转换后源码的一个位置。所以，第一个逗号前的内容，就对应该行源码的第一个位置，以此类推。 |
| 第三层是位置转换 | 以VLQ编码表示，代表该位置对应的转换前的源码位置。            |

```js
"mappings":"AAAA,IAAIA,EAAE,CAAN,CACIC,EAAE,CADN,CAEIC,EAAE;",
```

### 6.4 位置对应的原理

- 每个位置使用五位，表示五个字段

| 位置   | 含义                                      |
| :----- | :---------------------------------------- |
| 第一位 | 表示这个位置在（转换后的代码的）的第几列  |
| 第二位 | 表示这个位置属于sources属性中的哪一个文件 |
| 第三位 | 表示这个位置属于转换前代码的第几行        |
| 第四位 | 表示这个位置属于转换前代码的第几          |
| 第五位 | 表示这个位置属于names属性中的哪一个变量   |

> 首先，所有的值都是以0作为基数的。其次，第五位不是必需的，如果该位置没有对应names属性中的变量，可以省略第五位,再次，每一位都采用VLQ编码表示；由于VLQ编码是变长的，所以每一位可以由多个字符构成

> 如果某个位置是AAAAA，由于A在VLQ编码中表示0，因此这个位置的五个位实际上都是0。它的意思是，该位置在转换后代码的第0列，对应sources属性中第0个文件，属于转换前代码的第0行第0列，对应names属性中的第0个变量。

### 6.5 VLQ编码

- VLQ 是 Variable-length quantity 的缩写,它的特点就是可以非常精简地表示很大的数值
- VLQ编码是变长的。如果（整）数值在-15到+15之间（含两个端点），用一个字符表示；超出这个范围，就需要用多个字符表示。它规定，每个字符使用6个两进制位，正好可以借用Base 64编码的字符表

![base64](http://img.zhufengpeixun.cn/base64.png)

- 在这6个位中，左边的第一位（最高位）表示是否"连续"（continuation）。如果是1，代表这６个位后面的6个位也属于同一个数；如果是0，表示该数值到这6个位结束。
- 这6个位中的右边最后一位（最低位）的含义，取决于这6个位是否是某个数值的VLQ编码的第一个字符。如果是的，这个位代表"符号"（sign），0为正，1为负（Source map的符号固定为0）；如果不是，这个位没有特殊含义，被算作数值的一部分。

[base64vlq在线转换](http://murzwin.com/base64vlq.html)

以16来做示例吧

1. 将16改写成二进制形式10000
2. 在最右边补充符号位。因为16大于0，所以符号位为0，整个数变成100000
3. 从右边的最低位开始，将整个数每隔5位，进行分段，即变成1和00000两段。如果最高位所在的段不足5位，则前面补0，因此两段变成00001和00000
4. 将两段的顺序倒过来，即00000和00001
5. 在每一段的最前面添加一个"连续位"，除了最后一段为0，其他都为1，即变成100000和000001
6. 将每一段转成Base 64编码。
7. 查表可知，100000为g，000001为B。因此，数值16的VLQ编码为gB

```js
let base64 = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
];

function encode(num) {
    debugger;
    let binary = (num).toString(2);// 10000 转成二进制 
    binary = num > 0 ? binary + '0' : binary + '1';//正数最后边补0，负数最右边补1   100000
    //00001 00000
    let zero = 5 - (binary.length % 5);//4
    if (zero > 0) {
        binary = binary.padStart(Math.ceil(binary.length / 5) * 5, '0');
    }// 00001 00000
    let parts = [];
    for (let i = 0; i < binary.length; i += 5) {
        parts.push(binary.slice(i, i + 5));
    }
    parts.reverse();// ['00000','00001']
    for (let i = 0; i < parts.length; i++) {
        if (i === parts.length - 1) {
            parts[i] = '0' + parts[i];// ['100000','000001']
        } else {
            parts[i] = '1' + parts[i];
        }
    }
    let chars = [];
    for (let i = 0; i < parts.length; i++) {
        chars.push(base64[parseInt(parts[i], 2)]);
    }
    return chars.join('')
}
//16需要二个字符
let ret = encode(16);
console.log(ret);

function getValue(char) {
    let index = base64.findIndex(item => item == char);
    let str = (index).toString(2);
    str = str.padStart(6, '0');
    str = str.slice(1, -1);
    return parseInt(str, 2);
}

function decode(chars) {
    let values = [];
    for (let i = 0; i < chars.length; i++) {
        values.push(getValue(chars[i]));
    }
    return values;
}
function desc(values) {
    return `
    第${values[1] + 1}个源文件中
    的第1行
    第${values[0] + 1}列,
    对应转换后的第${values[2] + 1}行
    第${values[3] + 1}列,
    对应第${values[4] + 1}个变量`;
}
let ret2 = decode('IAAIA');
let message = desc(ret2);
console.log(ret2, message);
```

## 7. resolve解析

### 7.1 extension

指定extension之后可以不用在`require`或是`import`的时候加文件扩展名,会依次尝试添加扩展名进行匹配

```js
resolve: {
  extensions: [".js",".jsx",".json",".css"]
},
```

### 7.2 alias

配置别名可以加快webpack查找模块的速度

- 每当引入bootstrap模块的时候，它会直接引入`bootstrap`,而不需要从`node_modules`文件夹中按模块的查找规则查找

```diff
const bootstrap = path.resolve(__dirname,'node_modules/_bootstrap@3.3.7@bootstrap/dist/css/bootstrap.css');
resolve: {
    alias:{
        "bootstrap":bootstrap,
        "@": "src"
    }
},
```

### 7.3 modules

- 对于直接声明依赖名的模块（如 react ），webpack 会类似 Node.js 一样进行路径搜索，搜索`node_modules`目录

- 这个目录就是使用

  ```
  resolve.modules
  ```

  字段进行配置的 默认配置

  ```js
  resolve: {
  modules: ['node_modules'],
  }
  ```

  如果可以确定项目内所有的第三方依赖模块都是在项目根目录下的 node_modules 中的话

  ```js
  resolve: {
  modules: [path.resolve(__dirname, 'node_modules')],
  }
  ```

### 7.4 mainFields

默认情况下package.json 文件则按照文件中 main 字段的文件名来查找文件

```js
resolve: {
  // 配置 target === "web" 或者 target === "webworker" 时 mainFields 默认值是：
  mainFields: ['browser', 'module', 'main'],
  // target 的值为其他时，mainFields 默认值为：
  mainFields: ["module", "main"],
}
```

### 7.5 mainFiles

当目录下没有 package.json 文件时，我们说会默认使用目录下的 index.js 这个文件，其实这个也是可以配置的

```js
resolve: {
  mainFiles: ['index'], // 你可以添加其他默认使用的文件名
},
```

### 7.6 resolveLoader

`resolve.resolveLoader`用于配置解析 loader 时的 resolve 配置,默认的配置：

```js
module.exports = {
  resolveLoader: {
    modules: [ 'node_modules' ],
    extensions: [ '.js', '.json' ],
    mainFields: [ 'loader', 'main' ]
  }
};
```

## 8 noParse

- `module.noParse` 字段，可以用于配置哪些模块文件的内容不需要进行解析

- 不需要解析依赖（即无依赖） 的第三方大型类库等，可以通过这个字段来配置，以提高整体的构建速度

  ```js
  module.exports = {
  // ...
  module: {
    noParse: /jquery|lodash/, // 正则表达式
    // 或者使用函数
    noParse(content) {
      return /jquery|lodash/.test(content)
    },
  }
  }...
  ```

  > 使用 noParse 进行忽略的模块文件中不能使用 import、require、define 等导入机制

## 9 常用的plugin

### 9.1 ProvidePlugin

- webpack配置ProvidePlugin后，在使用时将不再需要import和require进行引入，直接使用即可
- _ 函数会自动添加到当前模块的上下文，无需显示声明

```diff
+ new webpack.ProvidePlugin({
+     _:'lodash'
+ })
```

> 没有全局的`$`函数，所以导入依赖全局变量的插件依旧会失败

### 9.2 DefinePlugin

`DefinePlugin`创建一些在编译时可以配置的全局常量

```js
new webpack.DefinePlugin({
    PRODUCTION: JSON.stringify(true),
    VERSION: "1",
    EXPRESSION: "1+2",
    COPYRIGHT: {
        AUTHOR: JSON.stringify("珠峰培训")
    }
})
console.log(PRODUCTION);
console.log(VERSION);
console.log(EXPRESSION);
console.log(COPYRIGHT);
```

- 如果配置的值是字符串，那么整个字符串会被当成代码片段来执行，其结果作为最终变量的值
- 如果配置的值不是字符串，也不是一个对象字面量，那么该值会被转为一个字符串，如 true，最后的结果是 'true'
- 如果配置的是一个对象字面量，那么该对象的所有 key 会以同样的方式去定义
- JSON.stringify(true) 的结果是 'true'

### 9.3 IgnorePlugin

IgnorePlugin用于忽略某些特定的模块，让 webpack 不把这些指定的模块打包进去

```js
import moment from  'moment';
console.log(moment);
new webpack.IgnorePlugin(/^\.\/locale/,/moment$/)
```

- 第一个是匹配引入模块路径的正则表达式
- 第二个是匹配模块的对应上下文，即所在目录名

### 9.4 webpack-bundle-analyzer

- 是一个webpack的插件，需要配合webpack和webpack-cli一起使用。这个插件的功能是生成代码分析报告，帮助提升代码质量和网站性能

  ```js
  cnpm i webpack-bundle-analyzer -D
  ```

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
module.exports={
  plugins: [
    new BundleAnalyzerPlugin()  // 使用默认配置
    // 默认配置的具体配置项
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'server',
    //   analyzerHost: '127.0.0.1',
    //   analyzerPort: '8888',
    //   reportFilename: 'report.html',
    //   defaultSizes: 'parsed',
    //   openAnalyzer: true,
    //   generateStatsFile: false,
    //   statsFilename: 'stats.json',
    //   statsOptions: null,
    //   excludeAssets: null,
    //   logLevel: info
    // })
  ]
}
{
 "scripts": {
    "dev": "webpack --config webpack.dev.js --progress"
  }
}
```

webpack.config.js

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
module.exports={
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled', // 不启动展示打包报告的http服务器
      generateStatsFile: true, // 是否生成stats.json文件
    }),
  ]
}
{
 "scripts": {
    "generateAnalyzFile": "webpack --profile --json > stats.json", // 生成分析文件
    "analyz": "webpack-bundle-analyzer --port 8888 ./dist/stats.json" // 启动展示打包报告的http服务器
  }
}
npm run generateAnalyzFile
npm run analyz
```

## 10 区分环境变量

- 日常的前端开发工作中，一般都会有两套构建环境
- 一套开发时使用，构建结果用于本地开发调试，不进行代码压缩，打印 debug 信息，包含 sourcemap 文件
- 一套构建后的结果是直接应用于线上的，即代码都是压缩后，运行时不打印 debug 信息，静态文件不包括 sourcemap
- webpack 4.x 版本引入了 `mode` 的概念
- 当你指定使用 production mode 时，默认会启用各种性能优化的功能，包括构建结果优化以及 webpack 运行性能优化
- 而如果是 development mode 的话，则会开启 debug 工具，运行时打印详细的错误信息，以及更加快速的增量编译构建

### 10.1 环境差异

- 生产环境
  - 可能需要分离 CSS 成单独的文件，以便多个页面共享同一个 CSS 文件
  - 需要压缩 HTML/CSS/JS 代码
  - 需要压缩图片
- 开发环境
  - 需要生成 sourcemap 文件
  - 需要打印 debug 信息
  - 需要 live reload 或者 hot reload 的功能...