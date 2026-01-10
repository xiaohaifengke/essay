什么是HTTP缓存，如何工作的？
当我们打开一个页面时，会向服务端发起很多次请求，如下图打开百毒首页，发起了HTML、各种图片、JS、CSS等资源共101次请求。这里面很多资源并不会频繁变化，每次打开页面都重新请求下载，就很浪费了。


浏览器缓存也称为HTTP缓存，HTTP缓存简单理解就是本地（浏览器）缓存了HTTP响应，以便后续复用，减少向服务端的请求。尤其对于一些静态资源，如图片、JS文件、CSS文件等资源，浏览器端缓存可以极大提升页面的加载速度，不用每次都都全部从服务端下载，也减轻了服务端的压力。
如下图，再次打开百度首页，可以看到很多图片、JS资源、CSS资源都是从缓存加载的，网页加载飞快。


缓存是一个很重要、很常用的技术，在IT系统中无处不在，基本原理都是就近存储可能要用的数据，用空间换时间，提升数据的加载效率。
● 前端浏览器缓存HTTP的响应。
● 后端服务的数据API也会有缓存，避免每次都访问数据库，数据库本身也会有缓存。
● CDN内容分发也是一种分布式的缓存。
● 计算机中的CPU、磁盘也都会有自己的缓存机制。

基于URL缓存资源
URL是定位资源的唯一路径，通常来说缓存也是基于URL地址的。但不仅限于URL，也支持以通过Header的字段Accept、Accept-Language 、 Accept-Encoding标记的不同内容进行缓存，可通过Vary字段来申明（/ˈveri/ 改变）

Vary: Accept-Language
1
存在什么地方？
主要存储在内存、磁盘上，具体存在哪则由浏览器来决定了，比如大文件可能会存在磁盘上，使用很频繁的资源可能会存储在内存中，或者都会存储。

● 内存 from memory cache：内存读取速度快，进程结束内存就释放了。
● 磁盘 from disk cache：读取速度稍慢（其实也是很快的），可以长久保存。

缓存规则
基本的缓存读取规则都是先从本地浏览器缓存查找，如果有且资源没有过期就用本地的，否则求去服务端请求。具体过程又分为强缓存、协商缓存：
● 第一次请求：本地没有，访问服务器获取响应，浏览器会缓存响应。
● 第二/N次请求：本地有缓存，缓存内容有效（没有过保质期），则响应状态码为200，直接使用本地缓存。—— 这个过程中，直接使用了本地的缓存内容称为“强缓存”。
● 第N次请求：本地有缓存，但缓存内容已过期，则会向服务端发起请求询问该资源是否有变化，服务端判断如果资源没变化，则返回304（资源没变化，可继续食用，没有body内容），浏览器使用本地缓存内容（并更新有效期）。如果服务端判断资源变了，则返回状态码200 + 新的资源，浏览器收到会更新缓存。—— 这个过程中，浏览器询问了服务端资源是否有效，进行了协商，称为“协商缓存”。

所以缓存的使用过程就是，先强缓存（本地缓存有效），再协商缓存。

304: Not Modified 资源未修改，客户端缓存了资源，重定向到本地。

强缓存：本地缓存
强缓存：浏览器自行决定的缓存处理机制，不需连接服务端。浏览器在请求资源时，先在浏览器缓存中查找，如果找到，且缓存有效期正常，则强缓存生效，直接从缓存中获取响应。否则就会使用协商缓存，向服务端发起请求。
所以这里关键就是判断缓存是否有效，是否在有效期内。关键（Header）字段就是：
● Cache-Control:max-age（HTTP/1.1）：缓存有效时长。

Cache-Control:max-age
Cache-Control 是HTTP/1.1中的一个Header字段，用来实现缓存的各种配置。常用指令max-age设置缓存的最大有效时长，用来替换Expires，如果同时存在则max-age优先。

HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1024
Date: Tue, 22 Feb 2022 22:22:22 GMT
Cache-Control: max-age=3600		//3600秒，表示一个小时内有效
1
2
3
4
5
Cache-Control常用指令：

指令	说明
max-age	缓存最大周期 (单位秒)，超过这个时间缓存被认为过期
no-cache	强制重新验证，不会直接使用本地缓存，必须每次都询问服务器，就是后文的协商缓存
no-store	不缓存，禁用缓存
public	都可以缓存的公共资源，客户端、代理服务器都可以缓存
private	个性化的、私有化内容，每个用户请求URL相同但的内容不同的资源，只能客户端缓存，代理服务器不可缓存
must-revalidate	过期后必须重新验证（revalidate /riˈvælɪˌdet/ 重新验证）
immutable	长时间缓存（/ɪˈmjuːtəb(ə)l/ 永恒的）
Cache-Control: private
Cache-Control: public, max-age=31536000  //1年有效期
Cache-Control: max-age=31536000, immutable
Cache-Control: max-age=0, must-revalidate  //立即失效，必须重新验证（协商缓存）
1
2
3
4
如果没有设置Cache-Control字段，采用“启发式缓存“，尽量的最大限度的使用缓存机制。

协商缓存：服务端验证
协商缓存：浏览器需要连接服务端，向服务端询问资源是否过期，服务端判断没过期就继续用本地缓存，否则返回新的资源。
1、✔️基本过程
● 请求HTTP资源时，先查找缓存，找到了但缓存过期，或缓存设置了no-cache，开始“协商缓存”。
● 发起一个HTTP请求，向服务端询问资源是否过期。
● 服务端收到请求后验证资源是否变更，若没变更则返回304（没有body，所以速度很快），告诉浏览器资源没有修改，可以继续使用本地缓存。否则返回200+新的资源。
2、✔️协商缓存的关键（Header）字段
● last-modified：资源最后修改时间。
● ETag：资源的唯一编码，文件内容变更后更新。
3、✔️触发协商缓存的条件
● Cache-Control:no-cache ：强制使用协商缓存。
● 本地缓存过期，或Cache-Control: max-age=0

last-modified 最后修改时间
last-modified 最后修改时间，服务端在Header上给出的资源最后修改时间。

第一次请求资源时，服务端会在响应Header中会返回last-modified字段。
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1024
Date: Tue, 22 Feb 2022 22:22:22 GMT
Last-Modified: Tue, 22 Feb 2022 22:00:00 GMT
Cache-Control: max-age=3600  //缓存有效期1个小时
1
2
3
4
5
6
再次请求该资源时，浏览器发现缓存资源已过期（时间已超过1个小时），开始“协商缓存”。
先发起一个（询问）HTTP请求，Header中加上if-modified-since（/ˈmɑːdɪfaɪd/ /sɪns/），值为上次的last-modified值。
GET /index.html HTTP/1.1
Host: example.com
Accept: text/html
If-Modified-Since: Tue, 22 Feb 2022 22:00:00 GMT
1
2
3
4
服务端收到请求，判断如果资源最后修改时间相同，认为资源没有变化，可以继续使用本地的缓存，则返回304（无body内容）。否则返回200+新的资源，并更新last-modified。
浏览器收到304响应后，从本地缓存获取资源，并恢复其正常缓存状态，更新Last-Modified，生命延迟1小时。
HTTP/1.1 304 Not Modified
Content-Type: text/html
Date: Tue, 22 Feb 2022 23:22:22 GMT
Last-Modified: Tue, 22 Feb 2022 22:00:00 GMT
Cache-Control: max-age=3600
1
2
3
4
5
如果浏览器收到200响应，同第一次请求资源一样，更新缓存资源。

⛔缺点：如果1s内有多次文件修改，则会判断出现问题，因此就有了下面的ETag。

ETag 资源唯一标签
ETag，机制和last-modified类似，ETag是文件内容的一个唯一标识符，文件变更后会更新标识符，可以看做是文件内容的摘要。值是服务端自定义生成的，目的是为了标记文件内容的版本，可以用版本号、哈希值等。
● 第一次请求资源时，服务端在响应Header中会返回ETag字段。
● 协商缓存时发送HTTP请求，浏览器在Header中加上If-None-Match，值为上一次的ETag值。
● 服务端收到请求，读取If-None-Match值，判断如果匹配一致，文件没更新，则返回304。否则返回200+新的资源，并更新ETag。
● 浏览器收到304响应后，从本地缓存获取资源，并恢复其正常缓存状态，更新ETag。
● 如果浏览器收到200响应，同第一次请求资源一样，更新缓存资源。

HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: max-age=0
Connection: keep-alive
Content-Length: 114
Content-Type: text/html
Date: Wed, 19 Apr 2023 09:05:30 GMT
Etag: "639b0692-72"
Expires: Wed, 19 Apr 2023 09:05:30 GMT   //2023年4月19日09:08，今天早上，现在是下午5点多了。
Last-Modified: Thu, 15 Dec 2022 11:35:46 GMT
1
2
3
4
5
6
7
8
9
10
📢相比较而言，ETag要更科学、更准确一些。文件修改了并不代码内容一定有变化，还有就是最后修改时间的单位是秒，如果1秒内的多次变化就会判断失误。Etag 优先级高于 Last-Modified。

总结流程图


实践
缓存应用
● 不经常变的静态资源，如JS、CSS、图片推荐使用强制缓存，Cache-Control: max-age=31536000。
● HTML文档推荐使用协商缓存，比如SPA的入口页面可以使用Cache-Control: no-cache强制每次都使用协商缓存。
● Last-Modified、ETag可同时使用，ETag优先级更高，但Last-Modified还有额外的价值，可用来标识文件的修改时间。
● 合理定制不同资源文件的缓存机制、缓存周期。
● 缓存的Header配置都是在服务端，可以通过Nginx配置。

清除缓存
● 浏览器强制（忽略缓存）刷新：Shift + F5，Command + Shift + R（Mac）。
● 清除浏览器缓存：设置 > 历史记录 > 清除浏览数据。
● 浏览器禁用缓存：浏览器调试模式下 > 网络 > 开启“停用缓存”

————————————————
版权声明：本文为CSDN博主「华妃」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/weixin_44792849/article/details/131430282