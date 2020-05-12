# 从Vue源码中学习到的细节

1. watch的回调可以是字符串，vue会根据该字符串查找methods中的方法。

2. Event Bus事件机制是同步的。看源码前想当然的认为这种自定义事件是异步触发的，看过源码后才发现是同步触发的。

11. $nextTick() 返回一个 Promise 对象[异步更新队列](https://cn.vuejs.org/v2/guide/reactivity.html#%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E9%98%9F%E5%88%97)
> 很久没关注官方文档里这块的文档，看过源码后再看文档，发现文档写的很详细。
