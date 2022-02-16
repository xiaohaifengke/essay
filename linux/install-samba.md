# Centos7下安装samba服务器

## 1. samba简介
Samba是在Linux和UNIX系统上实现SMB协议的一个免费软件，由服务器及客户端程序构成。SMB（Server Messages Block，信息服务块）是一种在局域网上共享文件和打印机的一种通信协议，它为局域网内的不同计算机之间提供文件及打印机等资源的共享服务。SMB协议是客户机/服务器型协议，客户机通过该协议可以访问服务器上的共享文件系统、打印机及其他资源。通过设置“NetBIOS over TCP/IP”使得Samba不但能与局域网络主机分享资源，还能与全世界的电脑分享资源。

## 2. 安装samba
使用docker镜像的方式可以简化samba的安装， 来实现不同系统之间共享目录。
- 直接运行samba镜像
    ```shell
    docker run -it -p 139:139 -p 445:445 -d dperson/samba
    ```
- 使用本地存储的方式
    ```shell
    docker run -it --name samba -p 139:139 -p 445:445 \
                -v /path/to/directory:/mount \
                -d dperson/samba
    ```
- 查看
	执行 `docker ps`确认samba容器启动成功
  
    ```shell
    docker run -it --name samba -p 139:139 -p 445:445 \
                -v /path/to/directory:/mount \
                -d dperson/samba
    ```
  
## 3. 配置参数
配置参数：
```
docker run -it --rm dperson/samba -h
Usage: samba.sh [-opt] [command]
Options (fields in '[]' are optional, '<>' are required):
    -h          This help
    -c "<from:to>" setup character mapping for file/directory names
                required arg: "<from:to>" character mappings separated by ','
    -g "<parameter>" Provide global option for smb.conf
                    required arg: "<parameter>" - IE: -g "log level = 2"
    -i "<path>" Import smbpassword
                required arg: "<path>" - full file path in container
    -n          Start the 'nmbd' daemon to advertise the shares
    -p          Set ownership and permissions on the shares
    -r          Disable recycle bin for shares
    -S          Disable SMB2 minimum version
    -s "<name;/path>[;browse;readonly;guest;users;admins;writelist;comment]"
                Configure a share
                required arg: "<name>;</path>"
                <name> is how it's called for clients
                <path> path to share
                NOTE: for the default value, just leave blank
                [browsable] default:'yes' or 'no'
                [readonly] default:'yes' or 'no'
                [guest] allowed default:'yes' or 'no'
                [users] allowed default:'all' or list of allowed users
                [admins] allowed default:'none' or list of admin users
                [writelist] list of users that can write to a RO share
                [comment] description of share
    -u "<username;password>[;ID;group]"       Add a user
                required arg: "<username>;<passwd>"
                <username> for user
                <password> for user
                [ID] for user
                [group] for user
    -w "<workgroup>"       Configure the workgroup (domain) samba should use
                required arg: "<workgroup>"
                <workgroup> for samba
    -W          Allow access wide symbolic links
    -I          Add an include option at the end of the smb.conf
                required arg: "<include file path>"
                <include file path> in the container, e.g. a bind mount

The 'command' (if provided and valid) will be run instead of samba
```
> 示例:
>
> 现在要将目录xw_share， 通过139和445端口进行共享， 并创建用户xw（密码为：overkill），禁用匿名用户访问，并且允许用户xw读写操作，可以如下设置：
>
> ```
> docker run -it --name samba -p 139:139 -p 445:445 \
> 	-v $PWD/nl_share:/mount -d dperson/samba -u "xw;overkill" \
>     -s "xw;/mount/;yes;no;no;all;xw;xw"
> ```
>
> 

参考：
- Samba (简体中文)
- samba百度百科
- [官方教程](https://github.com/dperson/samba)
- xwxwgo