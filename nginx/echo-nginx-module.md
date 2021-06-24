## nginx 的扩展模块 — echo 模块

为什么要费力安装echo模块？

echo方便调试......

### 一、echo模块的安装

1. echo模块的下载

   > echo-nginx-module模块的[github](https://github.com/openresty/echo-nginx-module#installation)地址。
   >
   > 选择一个安装目录 /home/nginx-echo-test/，在该目录中下载echo模块。

   ```shell
   [root@otitan nginx-echo-test]# wget https://github.com/openresty/echo-nginx-module/archive/v0.62.tar.gz
   [root@otitan nginx-echo-test]# tar -xzvf v0.62.tar.gz
   
   [root@otitan nginx-echo-test]# wget 'http://nginx.org/download/nginx-1.18.0.tar.gz'
   [root@otitan nginx-echo-test]# tar -xzvf nginx-1.18.0.tar.gz
   [root@otitan nginx-echo-test]# cd nginx-1.18.0/
   
   [root@otitan nginx-echo-test]# ll
   总用量 1072
   drwxrwxr-x. 5 root root     174 1月  23 2020 echo-nginx-module-0.62
   drwxr-xr-x. 8 1001 1001     158 12月  4 10:53 nginx-1.18.0
   -rw-r--r--. 1 root root 1039530 4月  21 2020 nginx-1.18.0.tar.gz
   -rw-r--r--. 1 root root   53329 12月  4 10:53 v0.62.tar.gz
   
   ```
   
2. 编译

   ```shell
   [root@otitan nginx-1.18.0]# ./configure --prefix=/opt/nginx \
   > --add-module=/home/nginx-echo-test/echo-nginx-module-0.62
   checking for OS
    + Linux 3.10.0-1127.el7.x86_64 x86_64
   checking for C compiler ... not found
   
   ./configure: error: C compiler cc is not found
   ```

   提示 `C compiler cc is not found` 时，需要安装 `gcc`和 `gcc-c++` 模块。

   ```shell
   [root@otitan nginx-1.18.0]# yum  -y install gcc gcc-c++ autoconf pcre pcre-devel make automake
   已加载插件：fastestmirror, langpacks
   Loading mirror speeds from cached hostfile
    * base: mirrors.ustc.edu.cn
    * extras: mirrors.ustc.edu.cn
    * updates: mirrors.ustc.edu.cn
   软件包 pcre-8.32-17.el7.x86_64 已安装并且是最新版本
   ......
   
   [root@otitan nginx-1.18.0]# ./configure --prefix=/opt/nginx \
   > --add-module=/home/nginx-echo-test/echo-nginx-module-0.62
   checking for OS
    + Linux 3.10.0-1127.el7.x86_64 x86_64
   checking for C compiler ... found
    + using GNU C compiler
    + gcc version: 4.8.5 20150623 (Red Hat 4.8.5-44) (GCC) 
   checking for gcc -pipe switch ... found
   checking for -Wl,-E switch ... found
   checking for gcc builtin atomic operations ... found
   checking for C99 variadic macros ... found
   ......
   checking for PCRE JIT support ... found
   checking for zlib library ... not found
   
   ./configure: error: the HTTP gzip module requires the zlib library.
   You can either disable the module by using --without-http_gzip_module
   option, or install the zlib library into the system, or build the zlib library
   statically from the source with nginx by using --with-zlib=<path> option.
   ```

   出现以上报错时，需要安装 `gcc`和 `gcc-c++` 模块：

   ```shell
   [root@otitan nginx-1.18.0]# yum install -y zlib-devel
   
   [root@otitan nginx-1.18.0]# ./configure --prefix=/opt/nginx --add-module=/home/nginx-echo-test/echo-nginx-module-0.62
   ......
   checking for zlib library ... found
   creating objs/Makefile
   
   Configuration summary
     + using system PCRE library
     + OpenSSL library is not used
     + using system zlib library
   
     nginx path prefix: "/opt/nginx"
     nginx binary file: "/opt/nginx/sbin/nginx"
     nginx modules path: "/opt/nginx/modules"
     nginx configuration prefix: "/opt/nginx/conf"
     nginx configuration file: "/opt/nginx/conf/nginx.conf"
     nginx pid file: "/opt/nginx/logs/nginx.pid"
     nginx error log file: "/opt/nginx/logs/error.log"
     nginx http access log file: "/opt/nginx/logs/access.log"
     nginx http client request body temporary files: "client_body_temp"
     nginx http proxy temporary files: "proxy_temp"
     nginx http fastcgi temporary files: "fastcgi_temp"
     nginx http uwsgi temporary files: "uwsgi_temp"
     nginx http scgi temporary files: "scgi_temp
   ```

   出现以上信息即代码编译成功

3. 使用

   参考 [echo-nginx-module](https://github.com/openresty/echo-nginx-module/blob/master/README.markdown) 文档。