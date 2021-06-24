# nrm小知识

接下来的项目里需要用到 `nrm`，为了不熟悉 `使用nrm` 的小伙伴，所以在这里做一个小小科普。



## nrm的出现



`nrm`是一个npm源管理器，允许你快速在npm源之间进行切换。为什么会这样说呢？`npm` 默认情况下是使用npm官方源(cmd  输入 `npm config ls`  命令查看：`https://registry.npmjs.org/` )。在国内使用这个源是不靠谱的，毕竟下载慢动不动是卡的要死。所以我们一般是使用淘宝源：`https://registry.npm.taobao.org/` ，接下来我们修改源，在cmd输入：



```
npm set registry https://registry.npm.taobao.org/
```



接着在cmd输入：



```
npm config ls
```



出现的视图如下，表示npm源切换成功：



![npm-config-ls.png](.\imgs\nrm\npm-config-ls.png)



这样的话，万一你在国外办公的时候要切换成官方源，或者在公司有自己的私有npm源，就需要切换成公司的源。`nrm` 就是这样出现的。



## nrm的操作



```
npm install -g nrm  //安装nrm

nrm ls //查看可选源(带*号的为当前源)
```



![nrm_ls.png](.\imgs\nrm\nrm-ls.png)



```
nrm current  //查看当前使用源
```



![nrm-current.png](.\imgs\nrm\nrm-current.png)



```
nrm use <registry>  //registry为源名  比如切换taobao源

nrm use taobao   //切换成taobao源
```



![nrm-use.png](.\imgs\nrm\nrm-use.png)



```
nrm add <registry> <url>   //registry为源名  url为源地址
//比如添加自己公司的私有npm源，源地址：http://192.168.28.11:3000/repository/npm-public/,源名为：company(任意取名称，作为自己公司的私有npm源的名称)


nrm add company http://192.168.28.11:3000/repository/npm-public/  
//出现  add registry company success   即为成功
//或者在cmd输入:nrm ls  出现了company也是成功的


nrm del <registry>  //registry为源名，删除某个源，比如删除刚刚的company
nrm del company  //出现  delete registry company success 即为删除成功

nrm test <registry>  //registry为源名，测试源的响应时间
nrm test taobao  //测试taobao源的响应时间
nrm test npm     //测试npm官方源的响应时间
```



![nrm-test.png](.\imgs\nrm\nrm-test.png)

## 补充



```
npm i cnpm -g --registry=https://registry.npm.taobao.org  //安装cnpm
// 最后的参数就是淘宝的镜像仓储url,并且cnpm是应用taobao源
cnpm -v  //查看版本号，并且证明安装成功
```