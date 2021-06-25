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
## 3.Docker加载镜像报错 Error response from daemon: dockerError processing tar file(exit status 1): no space left on device

问题原因：Docker加载镜像的空间不足了。

问题确认：

    step 1: `sudo docker info`查看Docker Root Dir: (默认为`/var/lib/docker`)  
    step 2: `df -hl`查看磁盘空间占用情况，确认 `step 1中Docker Root Dir:`所在磁盘的剩余空间  
解决方案：

    方案一：扩展Docker Root Dir所在磁盘的空间就可以解决这个问题。
    方案二：更改 Docker root path
        step 1: 关闭 Docker 服务 `sudo systemctl stop docker`
        step 2: 新建 Docker Root 路径 `sudo mkdir /root/docker`
        step 3: 新建 Docker 配置文件 `sudo touch /etc/docker/daemon.json`
        step 4: vim写入文件 `vim /etc/docker/daemon.json`
        step 5: 在文件中加入json语句 `{"graph": "/root/docker"}`(当docker版本太低时，试试`{"data-root": "/root/docker"}`)
        step 6: 重启docker 服务 `sudo systemctl start docker`，并 查看 `docker info`的`Docker Root Dir` 是否变为指定的root路径 `/root/docker`

## 4. 删除指定容器和虚悬镜像
删除指定容器：

    先停止容器：docker ps -f name=containername -q | xargs -r docker stop
    再删除容器：docker ps -a -f name=containername -q | xargs -r docker rm

删除虚悬镜像：`docker images -q -f dangling=true | xargs -r docker rmi -f`  

