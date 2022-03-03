# Vue 源码

## 核心原理

1. Vue 响应式原理

   1. 初始化数据
   2. 递归属性劫持
   3. 数组方法的劫持
   4. 数据代理

2. 模板编译

3. 渲染watcher

4. 依赖收集

   > 对象的每个属性都要有一个`dep`,每个`dep`中存放着`watcher`,同一个`watcher`会被多个`dep`所记录。
   >
   > 每个对象也有自己的dep(obj.__ob__)，用来当添加/删除属性时通知更新

   1. 在渲染时存储watcher
   2. 对象的依赖收集
   3. 数组的依赖收集（和对象依赖收集的区别）

5. Dom diff

6. computed 和 watch的区别

## 全局api

1. Vue.nextTick
2. Vue.set / Vue.delete
3. Vue.observable
4. Vue.use
5. Vue.extend