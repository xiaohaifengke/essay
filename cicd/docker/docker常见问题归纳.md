# Docker常见问题归纳

## 1. docker 快速删除指定镜像创建的容器

```xshell
docker rm $(docker ps -a | grep "watch-the-fun/jdk:8" | awk '{print $1}')
```

> 命令整体解释：
>  上述整个命令作用为查找由镜像`watch-the-fun/jdk:8`创建的所有容器并删除
>  命令拆分说明：
>  `|` 为管道符，主要作用为将前一命令的执行结果做为参数传入后一个命令
>  `docker ps -a` 查询所有创建的容器（包含未启动）
>  `grep "watch-the-fun/jdk:8"` 过滤镜像名为`watch-the-fun/jdk:8`的记录
>  `awk '{print $1}'` 按行查找记录中的第1列，该列为容器的id
>  `$()`用作命令替换

## 2. Error response from daemon: client version 1.40 is too new. Maximum supported API version is 1.39

这是由于Docker client 和 Docker server 的版本不一致导致的，API现在最多只能支持到1.39，但是client是1.40版本的。

解决办法：修改系统环境变量即可。

临时方案：

```xshell
export DOCKER_API_VERSION=1.39
```

永久方案：在/etc/profile和 ~/.bashrc 最后追加一个 export DOCKER_API_VERSION=1.39

```xshell
vi /etc/profile  #结尾追加
export DOCKER_API_VERSION=1.39
source  /etc/profile  #使配置生效
```

