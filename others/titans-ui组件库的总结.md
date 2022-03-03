# titans-ui组件库亮点总结

## 1. 是一个monorepo的项目

1. monorepo 的好处是**统一的工作流**和**Code Sharing**。不好的方面则主要是 repo 的体积较大，依赖很大。

> **只要搭建一套脚手架，就能管理（构建、测试、发布）多个 package**。
>
> 很方便的共享各个模块。

2. 我使用`pnpm` `workspace`来实现`monorepo`，使用`pnpm`安装包速度快，磁盘空间利用率高效，使用`pnpm`可以快速建立`monorepo`

## 2. 打包组件库的流程是使用gulp

> 打包流程可以通过`gulp`来进行流程控制

```json
"scripts": {
    "build": "gulp -f build/gulpfile.ts"
}
```

```bash
pnpm install gulp @types/gulp sucrase -w -D
```



