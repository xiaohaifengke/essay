# 项目中配置代码规范工具链

> 涉及到的工具链包括：ESLint/Stylelint/Prettier + husky + lint-staged + commitizen + commitlint
此篇中不讨论 ESLint/Stylelint/Prettier 的what, why,  when, where问题，直奔主题讲讲how。

## ESLint + Prettier 的集成
### 在 Webpack 配置中添加插件
先需要与 Webpack 集成(这一步通常在使用像vue-cli之类的工具生成的项目中已经集成好了)：
```command line
npm install eslint@7 eslint-webpack-plugin --save-dev
```
在 `webpack.config.js` 中添加 `eslint-webpack-plugin`:
```webpack.config.js
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  // ...
  plugins: [new ESLintPlugin(options)],
  // ...
};
```
### 配置文件 `.eslintrc.js`
ESLint查找配置文件的顺序为：
1. .eslintrc.js
2. .eslintrc.cjs
3. .eslintrc.yaml
4. .eslintrc.yml
5. .eslintrc.json
6. package.json
通常项目中的配置文件为 `.eslintrc.js`。

#### parserOptions
```.eslintrc.js
module.exports = {
    root: true,
    parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module' // 默认是 'script', 在 ECMAScript modules 中应设置为 'module'
    }
}
```

#### rules
配置代码规则：

"off"或0-关闭规则
"warn"或1-将该规则作为警告打开（不影响退出代码）
"error"或2-将规则作为错误打开（触发时退出代码为1）

#### plugins
eslint的规则可以通过rules配置，但是，不同场景、不同规范下有些定制的eslint检查需求，eslint默认提供的可选规则中如果没有，这个时候就需要做一些扩展了。plugin插件主要是为eslint新增一些检查规则。

#### extends
先简要介绍几个依赖包：
- `eslint-plugin-prettier`
    - 作用：一个形式上跟standard类似的一个代码规则，用来在基础规则上扩展的规则，eslint的rules规则优先级大于prettier的规则。
      
    - 提示：eslint-plugin-prettier不会为您安装Prettier或ESLint，你必须自己安装。
      
    - 使用prettier的扩展规则有两种方式：
        - 方式一：不需要写extends:"prettier"
        ```.eslintrc.js
        module.exports = {
          "plugins": ["prettier"],
          "rules": {
            "prettier/prettier": "error"
            // "prettier/prettier": ["error", {"singleQuote": true, "parser": "flow"}] 这里的配置会覆盖.prettierrc.js的配置
            // "prettier/prettier": ["error", {}, {
            //      "usePrettierrc": true // 开启这个配置，可以指定使用.prettierrc.js配置，不会和其他配置冲突
            //  }]
          }
        }
        ```
        但是这种规则与eslint的规则有冲突，规则冲突示例：
        ```command
        3:19  error  Replace `"Hello World"` with `'Hello World'`  prettier/prettier // prettier抛出
        3:19  error  Strings must use singlequote       quotes   // esLint抛出
        ```
        - 方式二：两种规则没有冲突，会自动去掉eslint冲突的规则，配置简单。这种方式往往配合 `eslint-config-prettier` 这个依赖包
        ```
          extends: [
              'plugin:prettier/recommended',
          ]
        ```
- `eslint-config-prettier`
    通过使用eslint-config-prettier配置，能够关闭一些不必要的或者是与prettier冲突的lint选项。这样我们就不会看到一些error同时出现两次。使用的时候需要确保，这个配置在extends的最后一项。

eslint-plugin-prettier
安装相关的依赖：
```command line
npm i eslint-plugin-vue @typescript-eslint/eslint-plugin @typescript-eslint/parser @vue/eslint-config-prettier @vue/eslint-config-typescript eslint-config-prettier eslint-plugin-prettier prettier -D
```
添加相关配置到extends中：
```.eslintrc.js
module.exports = {
    extends: [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/typescript/recommended",
        "plugin:prettier/recommended"
    ]
}
```
然后在 `eslintrc.js` 的 `rules` 中添加 `"prettier/prettier": "error"`，表示被 prettier 标记的地方抛出错误信息。
```.eslintrc.js
module.exports = {
    extends: [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/typescript/recommended",
        "plugin:prettier/recommended"
    ],
    rules: {
        "prettier/prettier": "error"
    }
}
```
如果与已存在的插件冲突时，可以安装 `eslint-config-prettier` 将 `Prettier` 的配置指定到单独的配置文件中（如 `.prettierrc.js`）。
`.prettierrc.js`的配置项说明：
```javascript
module.exports = {
    // 一行最多 80 字符
    printWidth: 80,
    // 使用 4 个空格缩进
    tabWidth: 4,
    // 不使用缩进符，而使用空格
    useTabs: false,
    // 行尾需要有分号
    semi: false,
    // 使用单引号
    singleQuote: true,
    // 对象的 key 仅在必要时用引号
    quoteProps: 'as-needed',
    // jsx 不使用单引号，而使用双引号
    jsxSingleQuote: false,
    // 末尾不需要逗号
    trailingComma: 'none',
    // 大括号内的首尾需要空格
    bracketSpacing: true,
    // jsx 标签的反尖括号需要换行
    jsxBracketSameLine: false,
    // 箭头函数，只有一个参数的时候，也需要括号
    arrowParens: 'always',
    // 每个文件格式化的范围是文件的全部内容
    rangeStart: 0,
    rangeEnd: Infinity,
    // 不需要写文件开头的 @prettier
    requirePragma: false,
    // 不需要自动在文件开头插入 @prettier
    insertPragma: false,
    // 使用默认的折行标准
    proseWrap: 'preserve',
    // 根据显示样式决定 html 要不要折行
    htmlWhitespaceSensitivity: 'css',
    // 换行符使用 lf
    endOfLine: 'lf'
};
```

## Stylelint
### 在 Webpack 配置中添加插件
先需要与 Webpack 集成：
```command line
npm install stylelint@13 stylelint-webpack-plugin --save-dev
```
在 `webpack.config.js` 中添加 `stylelint-webpack-plugin`:
```javascript
const StylelintPlugin = require('stylelint-webpack-plugin');

// 使用 webpack.config.js 的方式
module.exports = {
  // ...
  plugins: [new StylelintPlugin(options)],
  // ...
};

// 如果是使用webpack-chain的方式：
config.plugin("stylelint").use(StyleLintPlugin, [{
    files: ['src/**/*.vue', 'src/styles/**/*.((s(c|a)|c)ss)'],
    fix: true
  }])
```
根目录添加配置文件 `.stylelintrc.json` :
```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-recess-order",
    "stylelint-config-prettier"
  ],
  "plugins": [
    "stylelint-scss"
  ],
  "rules": {
    "at-rule-no-unknown": [true, {"ignoreAtRules" :[
      "mixin", "extend", "content", "include"
    ]}],
    "indentation": 2,
    "no-descending-specificity": null
  }
}
```
配置文件中单独配置 at-rule-no-unknown 是为了让 Stylelint 支持 SCSS 语法中的 mixin、extend、content 语法。

### 安装其它依赖：
```command line
npm i stylelint-config-prettier stylelint-config-standard stylelint-order stylelint-config-recess-order stylelint-scss -D
```
#### 依赖简介
- `stylelint-config-prettier`: 在 `.stylelintrc.json` 的 `extends` 中添加 `"stylelint-config-prettier"` ,确保此项放在`extends`字段列表的最后一项，这样可以覆盖其它配置。
- `stylelint-config-standard`: `stylelint-config-standard` 是 `Stylelint` 的推荐配置
- `stylelint-config-recommended`: 此依赖会将所有样式问题都暴露出来
- `stylelint-order`: `stylelint-order` 是 css 属性排序插件
- `stylelint-config-recess-order`: `stylelint-order` 插件的第三方配置
- `stylelint-scss`: scss 拓展，增加支持 scss 语法

## vscode 编辑器安装插件
安装扩展： stylelint-plus、Vetur、Beautify
```
"stylelint.autoFixOnSave": true,  // 保存自动格式化
"vetur.format.defaultFormatter.html": "js-beautify-html",  // 格式化模板
"vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
        "wrap_attributes": "force-aligned",  // 第一个属性后开始折行，并对齐
},
```
在 vscode 中安装插件：stylelint-plus

当然也可以选择普通的 stylelint 插件，不过 plus 版本有保存即 fix 的功能

## 与 Git 整合
在当前项目使用 Git 的前提下， 在 pre-commit hook 中检查代码风格，也可以直接使用工具fix；在 commit-msg hook中检查 commit message 是否符合规范。
使用 [husky](https://github.com/typicode/husky) 添加各种git hooks中执行的操作。这里使用`husky >= 7`,先安装 `husky`:
```command line
npm install husky@7 -D
```

### 整合 pre-commit
安装 `lint-staged`：
```command line
npm install lint-staged -D
```
添加一个hook `pre-commit` :
```command line
npx husky install
npx husky add .husky/pre-commit "npx --no-install lint-staged"
```
在 `package.json` 中添加 `lint-staged`字段：
```json
{
    "lint-staged": {
        "src/**/*.vue": [
          "stylelint --fix",
          "prettier --write",
          "eslint --ext .vue,.js"
        ],
        "src/**/*.js": [
          "prettier --write",
          "eslint --ext .vue,.js"
        ],
        "src/**/*.((s(c|a)|c)ss)": [
          "stylelint --fix",
          "prettier --write"
        ]
    }
}
```

### 整合 commit-msg
安装 `commitlint`：
```command line
npm install commitlint @commitlint/cli @commitlint/config-conventional @commitlint/prompt-cli commitizen cz-conventional-changelog conventional-changelog conventional-changelog-cli -D
```
添加一个hook `commit-msg` :
```command line
npx husky add .husky/commit-msg "npx --no-install commitlint --edit "$1""
```
在项目根目录下添加文件 `commitlint.config.js`:
```javascript
module.exports = { extends: ["@commitlint/config-conventional"] };
```

在 `package.json` 中添加 `config`字段：
```json
{
    "scripts": {
        "cz": "git-cz",
        "version": "conventional-changelog -p angular -i CHANGELOG.md -s && git add CHANGELOG.md"
    },
    "config": {
        "commitizen": {
          "path": "./node_modules/cz-conventional-changelog"
        }
    }
}
```
用 `npm run cz` 代替 `git commit -m "xxx""`进行commit操作。

