# titans-ui组件库亮点总结

## 1. 是一个monorepo的项目

1. monorepo 的好处是**统一的工作流**和**Code Sharing**。不好的方面则主要是 repo 的体积较大，依赖很大。

> **只要搭建一套脚手架，就能管理（构建、测试、发布）多个 package**。
>
> 很方便的共享各个模块。

2. 我使用`pnpm` `workspace`来实现`monorepo`，使用`pnpm`安装包速度快，磁盘空间利用率高效，使用`pnpm`可以快速建立`monorepo`

3. 在项目根目录下建立`pnpm-workspace.yaml`配置文件

   ```yaml
   packages:
     - 'packages/**' # 存放编写组件的
     - docs # 存放文档的
     - play # 测试组件的
   ```


4. 为了防止不是用pnpm这个包管理工具安装的依赖，在preinstall钩子中校验。

   ```json
   "preinstall": "npx only-allow pnpm"
   ```

   

## 2. 打包组件库的流程

> 使用gulp控制打包流程。
>
> 因为打包组件库还涉及到ts文件的声明文件，如果直接使用tsc编译的话，生成的目录结构无法控制，会不符合预期。

```json
"scripts": {
    "build": "gulp -f build/gulpfile.ts"
}
```

```bash
pnpm install gulp @types/gulp sucrase -w -D
```



### 2.1 打包前清空输出目录

```js
/**
 * 1. clean
 * 2. build style
 * 3. build utils
 * 4. build all components
 * 5. build every component
 * 6. copy package.json/README.md and so on
 * 7. publish
 */
import { series, parallel } from 'gulp';
import { withTaskName, run } from './utils'
export default series(
    withTaskName('clean', () => run('rm -rf ./dist')),
)
```

### 2.2 打包style

1. 输入指定目录的文件
2. 通过gulp-sass插件调用dartSass来编译scss文件
3. 通过gulp-autoprefixer添加浏览器兼容性前缀
4. 通过gulp-clean-css来压缩css文件
5. 输出到指定目录

```
withTaskName('buildPackages', () =>
  run(`pnpm run --filter ./packages --parallel build`)
),
```

```js
import { series, src, dest } from 'gulp'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import autoprefixer from 'gulp-autoprefixer'
import cleanCSS from 'gulp-clean-css'
import chalk from 'chalk'
import { titansTheme } from '../../build/utils/paths'
import path from 'path'

const sass = gulpSass(dartSass)

async function buildStyles() {
  return src('./src/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(
      cleanCSS({}, (details) => {
        console.log(
          `${chalk.cyan(details.name)}: ${chalk.yellow(
            details.stats.originalSize / 1024
          )} KB -> ${chalk.green(details.stats.minifiedSize / 1024)} KB`
        )
      })
    )
    .pipe(dest(path.resolve(titansTheme, 'css')))
}

export default series(buildStyles)
```

### 2.3 打包工具模块

> 工具模块中需要打包的全部是ts文件，所以仅需要把ts转成ESNext/CommonJS规范的js文件，并且生成声明文件即可。

1. 调用gulp-typescript插件的createProject方法，根据tsconfig.json生成一个编译ts文件流的tsProject，
2. 通过配置tsConfig.json中的module为ESNext和CommonJS分别生成对应模块规范的文件。
3. 指令中可能通过monorepo提供的引用方式@titans-ui/xxx，在编译时需要被替换成最终包的路径titans-ui/

```typescript
import ts from 'gulp-typescript'
import { src, dest, series, parallel } from 'gulp'
import path from 'path'
import { buildConfig } from './utils/config'
import { run, withTaskName } from './utils'
import { distRoot, projectRoot } from './utils/paths'
import replace from 'gulp-replace'

export default function buildPackages(pkgPath: string, pkgName: string) {
  const tsConfig = path.resolve(projectRoot, 'tsconfig.json')
  const tasks = Object.values(buildConfig).map((config) => {
    const outputName = config.output.name
    const outputDir = path.resolve(config.output.path, pkgName)
    return series(
      withTaskName(
        `buildPackages:build::${pkgName}(${outputName})`,
        async () => {
          const inputs = ['**/*.ts', '!gulpfile.ts', '!node_modules/']
          const tsProject = ts.createProject(tsConfig, {
            module: config.module,
            declaration: true,
            moduleResolution: 'node',
            strict: false
          })
          src(inputs)
            .pipe(tsProject())
            .pipe(replace('@titans-ui/', `titans-ui/${outputName}/`))
            .pipe(dest(outputDir))
        }
      )
    )
  })
  return parallel(...tasks)
}
```

### 2.4 打包所有组件

> 打包所有组件即dist/index.esm.js和dist/index.js, 不需要生成 .d.ts
>
> rollup的输入项需要 rollup-plugin-typescript2和rollup-plugin-vue以及rollup官方插件@rollup/plugin-node-resolve和@rollup/plugin-commonjs
>
> rollup的输出项分别是：
>
> esm: {format: esm, file: ''},
>
> umd: {format: umd, file, exports: named, name: LibName, external(id) {}}
>
> [export项解释](https://www.rollupjs.com/guide/big-list-of-options#exports)

```typescript
const plugins = [
  vue({
    target: 'browser'
  }),
  nodeResolve(),
  commonjs(),
  typescript()
]
async function buildAllComponents() {
  const inputOptions = {
    input: path.resolve(titansDir, 'index.ts'),
    plugins,
    external(id) {
      return /^vue/.test(id)
    }
  }
  const outputOptions: OutputOptions[] = [
    {
      format: 'umd',
      file: path.resolve(titansDist, 'index.js'),
      name: 'TitansUI',
      exports: 'named',
      globals: {
        vue: 'Vue'
      }
    },
    {
      format: 'esm',
      file: path.resolve(titansDist, 'index.esm.js')
    }
  ]
  // create a bundle
  const bundle = await rollup(inputOptions)

  return Promise.all(outputOptions.map((option) => bundle.write(option)))
}
```

### 2.5 打包组件库所有组件的入口文件

> 将packages/titans-ui/index.ts编译到 dist/[es|lib]/index.js
>
> 生成 dist/[es|lib]/index.js 的声明文件 index.d.ts

因为入口文件就一个，所以打包入口文件类似于打包全部组件，打包入口文件时需要排除所有的引入项。

同时，需要单独再生成入口文件的声明文件。

使用ts-morph可以只生成声明文件。

### 2.6 打包每个组件

```
/**
 * 1. 打包每个组件 components 中的每个文件夹
 * 2. 打包组件入口文件：components/index.ts
 * 3. 给components中的所有文件生成ts的声明文件到types/components中，
 *    然后将生成的.d.ts文件分别拷贝到 dist/titans-ui/es/components 和 dist/titans-ui/lib/components中
 * 4. 删除步骤3中生成的 types 文件夹
 */
/**
 * 对于在组件中引用utils中的工具方法时：如 import *** from '@titans-ui/utils/index.ts'
 * 在构建过程中有两个关键点：
 * 1. 因为utils已经编译过，此处不需要打包进来，故在rollup打包时需要排除 @titans-ui/utils 中的代码
 * 2. 在打包后如果代码中依然是 import *** from '@titans-ui/utils/index.ts' 的话，
 * '@titans-ui/utils/index.ts' 此路径会不存在，所以需要重写路径，把 import *** from '@titans-ui/utils/index.ts'
 * 修改为 import *** from 'titans-ui/[es|lib]/utils/index.ts' 这样才不会出现路径不存在的问题。
 */
 /* 打包每个组件 components 中的每个文件夹 */
const buildEachComponent = async () => {
  const dirs = sync('*', {
    cwd: componentsDir,
    onlyDirectories: true
  })

  const tasks = dirs.map(async (dir) => {
    const input = path.resolve(componentsDir, dir, 'index.ts')
    const inputOptions = {
      input,
      plugins: [
        vue({
          target: 'browser'
        }),
        nodeResolve(),
        commonjs(),
        typescript()
      ],
      external(id) {
        return /^vue/.test(id) || /^@titans-ui/.test(id)
      }
    }
    const bundle = await rollup(inputOptions)

    const eachComponentTasks = Object.values(buildConfig).map((config) => {
      const outputOptions: OutputOptions = {
        format: config.format as ModuleFormat,
        file: path.resolve(config.output.path, `components/${dir}/index.js`),
        paths: pathRewriter(config.output.name),
        exports: 'named'
      }
      return bundle.write(outputOptions)
    })
    return Promise.all(eachComponentTasks)
  })
  return Promise.all(tasks)
}

/* 生成ts的声明文件 */
async function genTypes() {
  const project = new Project({
    tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      declaration: true,
      allowJs: true,
      emitDeclarationOnly: true,
      noEmitOnError: true,
      outDir: path.resolve(distRoot, 'types'),
      baseUrl: projectRoot,
      paths: {
        '@titans-ui/*': ['packages/*'],
        dayjs: ['node_modules/dayjs/']
      },
      skipLibCheck: true,
      strict: false
    }
  })
  const projectFilePaths = sync('**/*', {
    cwd: componentsDir,
    onlyFiles: true,
    absolute: true
  })
  const sourceFiles: SourceFile[] = []
  await Promise.all(
    projectFilePaths.map(async (file) => {
      if (file.endsWith('.vue')) {
        const content = await fs.readFile(file, 'utf-8')
        const sfc = vueCompiler.parse(content)
        const { script } = sfc.descriptor
        if (script?.lang === 'ts') {
          let content = script.content
          const sourceFile = project.createSourceFile(`${file}.ts`, content)
          sourceFiles.push(sourceFile)
        }
      } else if (file.endsWith('.ts')) {
        const sourceFile = project.addSourceFileAtPath(file)
        sourceFiles.push(sourceFile)
      }
    })
  )
  const diagnostics = project.getPreEmitDiagnostics()
  console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))
  await project.emit({
    emitOnlyDtsFiles: true
  })

  const sourceFileTasks = sourceFiles.map(async (sourceFile: SourceFile) => {
    const relativePath = path.relative(packagesDir, sourceFile.getFilePath())
    const emitOutput = sourceFile.getEmitOutput()
    // console.log(relativePath, emitOutput, emitOutput.getOutputFiles())
    const outputFileTasks = emitOutput
      .getOutputFiles()
      .map(async (outputFile) => {
        const filepath = outputFile.getFilePath()
        await fs.mkdir(path.dirname(filepath), {
          recursive: true
        })
        const outputFileText = outputFile.getText()
        await fs.writeFile(filepath, pathRewriter('es')(outputFileText))
      })
    await Promise.all(outputFileTasks)
  })
  await Promise.all(sourceFileTasks)
}

function copyTypes() {
  const src = path.resolve(distRoot, 'types/components/')
  const copy = (module) => {
    let output = path.resolve(distTitans, module, 'components')
    return withTaskName(`eachComponent:copyTypes(${module})`, () =>
      run(`cp -r ${src}/* ${output}`)
    )
  }
  return parallel(copy('es'), copy('lib'))
}

async function buildComponentEntry() {
  const inputOptions = {
    input: path.resolve(componentsDir, 'index.ts'),
    plugins: [typescript()],
    external(id): boolean {
      return true
    }
  }
  const bundle = await rollup(inputOptions)
  return Promise.all(
    Object.values(buildConfig).map((config) => {
      const outputOptions: OutputOptions = {
        format: config.format as ModuleFormat,
        file: path.resolve(config.output.path, `components/index.js`)
      }
      return bundle.write(outputOptions)
    })
  )
}

export const eachComponent = series(
  withTaskName('eachComponent:buildEachComponent', buildEachComponent),
  withTaskName('eachComponent:buildComponentEntry', buildComponentEntry),
  withTaskName('eachComponent:genTypes', genTypes),
  copyTypes(),
  withTaskName('eachComponent:clean(types)', () => run('rm -rf dist/types'))
)
```

### 2.7 复制package.json和README.md等

把index.css拷贝一份到dist中供用户使用

## 3. 升级版本时的脚本

1. 在执行npm version xxx 时，定义version脚本： gulp -f build/update-version.ts,更新workspace中的版本

2. 在postversion脚本中重新执行 build 脚本

## 4. publish

发布时用的package.json是titans-ui模块下的文件，所以可以单独定制，与项目中的package.json文件不冲突。

## 5. 工程化方面

集成了 eslint/prettier/stylelint/commitlint

## 6. 文档用的是vitepress

## 7. 不足

- 文档无版本控制
- 无规范的changelog
- 目前发版未完全按 npm version major/minor/patch的规则发布
- 有的组件还有些小bug