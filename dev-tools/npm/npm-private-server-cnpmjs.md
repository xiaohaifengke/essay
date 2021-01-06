# npm私有库--Cnpmjs.org

## Cnpmjs.org的流程

> github的[地址](https://github.com/cnpm/cnpmjs.org)



```
//安装cnpmjs.org  建议克隆源码，针对公司内部进行个性化改造
git clone https://github.com/cnpm/cnpmjs.org.git

//安装项目依赖   cd cnpmjs.org
npm install
```



安装完后，在项目的根目录下找配置文件 `config/index.js` ，这里面的信息量很多，我们只需要关注下几项就可以啦，详细配置的[地址](https://github.com/cnpm/cnpmjs.org/blob/3.0.0-rc.37/config/index.js)



```
/*
 * server configure //服务器配置
 */

registryPort: 7001,         //仓库访问端口（执行发布安装）
webPort: 7002,              //展示查询站点访问端口
bindingHost: '',            //监听绑定的 Host，默认127.0.0.1，外网访问注释掉此项即可


/**
* database config           //数据库相关设置
*/

database: {
    db: 'cnpmjs',           //数据库名称
    username: 'root',       //数据库访问账号
    password: '123456',     //数据库访问密码

    // the sql dialect of the database  数据库支持的类型
    // - currently supported: 'mysql', 'sqlite', 'postgres', 'mariadb'
    dialect: 'mysql',       //使用数据库，默认sqlite，这里我们改成mysql

    // custom host; default: 127.0.0.1
    host: '127.0.0.1',      //数据库访问IP，通常127.0.0.1

    // custom port; default: 3306
    port: 3306,             //数据库访问端口，通常3306

  // 数据库连接池使用默认配置就好
  // 目前只支持  mysql 和 postgresql (since v1.5.0)
  pool: {
    maxConnections: 10,
    minConnections: 0,
    maxIdleTime: 30000
//...

// 模块文件存储，默认将发布的私有模块跟缓存公共模块存储在本地文件系统中，路径~/.cnpmjs.org/nfs ,也就是模块文件都存储在这个目录下；或者可以选择三方储存方式比如七牛等，着这里配置插件；也支持接口开发扩展储存；

nfs: require('fs-cnpm')({
    dir: path.join(dataDir, 'nfs')
}),

// registry url name        //模块注册列表访问域名，默认r.cnpmjs.org，安装模块时会到这个域名下查找，这个默认设置略坑，建议没有外网域名的先清空回头再配
registryHost: '',


// default system admins    //默认管理员账号
  admins: {
    // name: email
    //fengmk2: 'fengmk2@gmail.com',
    admin: 'admin@cnpmjs.org',
    //dead_horse: 'dead_horse@qq.com',
  },


/*
 * registry mode config  私有模块发布相关配置
*/

  //是否开启私有模式，默认为 false；
  //私有模式下只有管理员能发布模块，其他账号只有同步权限
  //非私有模式，注册用户都可以发布模块
  enablePrivate: false, 

  // registry scopes
  //若为非私有模式发布则此项必填，非管理员发布模块式命名必须以scopes字段开头，模块命名示例“@cnpm/packagename”
  //更多了解npm-scope请查阅https://docs.npmjs.com/misc/scope
  scopes: [ '@cnpm', '@cnpmtest', '@cnpm-test' ],

  // 私有模块非scopes白名单，各种非以scope方式发布的老模块的白名单管理，数组形式维护
  privatePackages: [],


/**
* sync configs 同步源仓库相关设置
*/

//npm官方registry地址，不会直接从这个地址同步模块，但有时会从这里获取模块信息，除非必要请勿更改
officialNpmRegistry: 'https://registry.npmjs.com',
officialNpmReplicate: 'https://replicate.npmjs.com',

//同步模块上游registry地址
sourceNpmRegistry: 'https://registry.npm.taobao.org',

//上游registry是否是cnpm，默认true，若要使用npm官方地址作为同步上游，请设置为false
sourceNpmRegistryIsCNpm: true,

//若安装时模块不存在，是否向源registry进行同步，默认true
syncByInstall: true,

// 同步模式选项
// none: 不进行同步，只管理用户上传的私有模块，公共模块直接从上游获取
// exist: 只同步已经存在于数据库的模块
// all: 定时同步所有源registry的模块
syncModel: 'none', // 'none', 'all', 'exist'

// 同步时间间隔，默认10分钟
syncInterval: '10m',


// 是否同步模块中devDependencies，默认false
syncDevDependencies: false,

//用户账号系统接入，可以扩展接入公司的账号系统
//详见https://github.com/cnpm/cnpmjs.org/wiki/Use-Your-Own-User-Authorization
userService: null,
enableAbbreviatedMetadata: true,
```



## 安装数据库



我选择的 mysql ，这里不介绍怎么安装 mysql 了，有需要请[**戳这里** ](https://www.runoob.com/mysql/mysql-install.html)。当然你也可以选择其他数据库，目前支持 mysql、 sqlite、 postgres、 mariadb，默认是 sqlite。



如何进行`安装 mysql` 可以自行百度或者向群里的朋友们求助呀！



```
启动mysql
```



```
mysql -uroot -p123456   //mysql  -u 用户名 -p 密码  要跟前面的文件进行数据库配置呀！
```



```
创建数据库
```



```
create database cnpmjs;
```



```
切换到cnpmjs数据库
```



```
use cnpmjs;
```



`导入cnpmjs的数据库配置文件`  文件是在：/cnpmjs.org/docs/db.sql



```
source docs/db.sql; //默认当前操作路径就在 cnpmjs.org 项目下，如果不是，请使用 db.sql 的绝对路径
```



```
查看导入的表
```



```
show tables; //如下图所示
```



![1_cnpm.png](.\imgs\cnpm\abcde.png)



`小小注意：` 由于cnpmjs.org本身并不支持window环境，所以在window启动需要修改一些东西



直接在当前文件目录下，cmd输入：`node dispatch.js`



或者修改下`package.json` ,把`"dev": "DEBUG=cnpm* node dispatch.js"` 修改为`"dev": "set DEBUG=cnpm* node dispatch.js"`



成功启动服务就可以访问页面啦！



![2_cnpm.png](.\imgs\cnpm\1609507586762-a16a07bf-c9aa-495e-80db-7a8946e6a3dc.png)



图片中所标注的：在浏览器地址栏输入：`127.0.0.1:7002`  回车，打开页面即为成功！



`127.0.0.1:7001` 也很重要呀，用于发布包和进行权限的作用！



## 包的流程



接下来的流程跟`verdaccio 章节` 是一样的流程，所以就不再一一详解啦！



就注意一点：私服的地址是`127.0.0.1:7001`  ，所以呢



```
nrm add test http://127.0.0.1:7001
nrm use test
//换成私服状态啦，就可以继续下面的流程啦
//接下来靠自己来一遍啦  ~_~
```

还有一点需要注意的是包的名称必须含有下图所示的字段，否则一直发布不了，报403错误。`npm init` 的时候记得取名字的时候带上这个字段。![image.png](.\imgs\cnpm\1609507705849-846cdd57-a8fa-4335-8ab0-9aa16b17451e.png)

## 小小扩展 ---私有包存储上云



cnpmjs.org 项目配置项里面有一个 `nfs` 配置，这里定义了一个 npm 文件系统（NFS）。私有仓库在同步和上传的时候，会交给 NFS 对象相应的函数去处理，NFS 对象返回处理结束之后再返回下载链接，所以通过自定义 NFS 模块可以实现 npm 包的各种定制存储。目前官方默认使用 `fs-cnpm`，该模块会将上传或者同步的包保存在服务器本地的 `/root/.cnpmjs.org/doenloads/` 目录下。这种方式比较传统，一方面随着私有包数量的不断增加，存储资源会是一个瓶颈。另一方面需要定时的备份资源，不然哪天磁盘坏了，那就只有凉凉送给你啦！



这个时候将私有包或者同步的资源放到云上就是一个非常好的方案。cnpmjs.org 官方早就为我们想到了这点，给出了下面几种 NFS 模块：



- **upyun-cnpm** (https://link.jianshu.com?t=https://github.com/cnpm/upyun-cnpm)：又拍云存储插件
- **fs-cnpm** (https://link.jianshu.com?t=https://github.com/cnpm/fs-cnpm)：本地存储的插件
- **sfs-client** (https://link.jianshu.com?t=https://github.com/cnpm/sfs-client)：**SFS** (https://link.jianshu.com?t=https://github.com/cnpm/sfs)（Simple FIle Store）存储插件
- **qn-cnpm** (https://link.jianshu.com?t=https://github.com/cnpm/qn-cnpm)：七牛云存储插件
- **oss-cnpm** (https://link.jianshu.com?t=https://github.com/cnpm/oss-cnpm)：阿里云 OSS 存储插件



这些模块已经能够满足我们绝大部分的场景，如果你有特殊的需求，可以参看 **nfs模块规范** (https://www.v2ex.com/t/294255) 进行定制化开发。



-----------------------------------------

## Cnpmjs.org_zH

有兴趣的小伙伴可以自己看看呀，针对重要的地方进行了翻译。

```
'use strict';

var mkdirp = require('mkdirp');
var copy = require('copy-to');
var path = require('path');
var fs = require('fs');
var os = require('os');
var utility = require('utility');

var version = require('../package.json').version;

var root = path.dirname(__dirname);
var dataDir = path.join(process.env.HOME || root, '.cnpmjs.org');

var config = {
  version: version,
  dataDir: dataDir,

  /**
   * Cluster mode   集群模式
   */
  enableCluster: false,   //是否启用 cluster-worker 模式启动服务，默认 false，生产环节推荐为 true;
  numCPUs: os.cpus().length,

  /*
   * server configure  服务器配置
   */

  registryPort: 7001,   //仓库访问端口（执行发布安装的网址）
  webPort: 7002,        //展示查询站点访问端口（可视化页面的查询）
  bindingHost: '127.0.0.1', // only binding on 127.0.0.1 for local access 监听绑定的 Host，默认127.0.0.1，外网访问注释掉此项即可
  // default is ctx.protocol  
  protocol: '',

  // debug mode  调试模式
  // if in debug mode, some middleware like limit wont load  如果在调试模式下，某些中间件如限制负载
  // logger module will print to stdout 日志模块打印出来
  debug: process.env.NODE_ENV === 'development',
  // page mode, enable on development env
  pagemock: process.env.NODE_ENV === 'development',
  // session secret
  sessionSecret: 'cnpmjs.org test session secret',
  // max request json body size
  jsonLimit: '10mb',
  // log dir name  日志目录
  logdir: path.join(dataDir, 'logs'),
  // update file template dir 临时上传文件
  uploadDir: path.join(dataDir, 'downloads'),
  // web page viewCache  视图模板缓存是否开启，默认是false
  viewCache: false,

  // registry http response cache control header
  // if you are using CDN, can set it to 'max-age=0, s-maxage=10, must-revalidate'
  // it meaning cache 10s on CDN server and no cache on client side.
  registryCacheControlHeader: '',
  // if you are using CDN, can set it to 'Accept, Accept-Encoding'
  registryVaryHeader: '',
  // disable package search
  disableSearch: false,

  // view files directory
  viewDir: path.join(root, 'view', 'web'),

  customRegistryMiddlewares: [],
  customWebMiddlewares: [],

  // config for koa-limit middleware
  // for limit download rates
  limit: {
    enable: false,
    token: 'koa-limit:download',
    limit: 1000,
    interval: 1000 * 60 * 60 * 24,
    whiteList: [],
    blackList: [],
    message: 'request frequency limited, any question, please contact fengmk2@gmail.com',
  },

  enableCompress: false, // enable gzip response or not  是否开启 gzip 压缩，默认为 false

  // default system admins 默认系统管理员
  admins: {
    // name: email 
    fengmk2: 'fengmk2@gmail.com',
    admin: 'admin@cnpmjs.org',
    dead_horse: 'dead_horse@qq.com',
  },

  // email notification for errors  错误时会用电子邮件通知
  // check https://github.com/andris9/Nodemailer for more informations
  mail: {
    enable: false,   
    appname: 'cnpmjs.org',
    from: 'cnpmjs.org mail sender <adderss@gmail.com>',
    service: 'gmail',
    auth: {
      user: 'address@gmail.com',
      pass: 'your password'
    }
  },

  logoURL: 'https://os.alipayobjects.com/rmsportal/oygxuIUkkrRccUz.jpg', // cnpm logo image url
  adBanner: '',
  customReadmeFile: '', // you can use your custom readme file instead the cnpm one
  customFooter: '', // you can add copyright and site total script html here
  npmClientName: 'cnpm', // use `${name} install package`
  packagePageContributorSearch: true, // package page contributor link to search, default is true

  // max handle number of package.json `dependencies` property
  maxDependencies: 200,
  // backup filepath prefix
  backupFilePrefix: '/cnpm/backup/',

  /**
   * database config  数据库配置
   */

  database: {
    db: 'cnpmjs_test',  //数据库名称
    username: 'root',   //数据库访问账号
    password: '',       //数据库访问密码

    // the sql dialect of the database  //使用数据库，默认sqlite
    // - currently supported: 'mysql', 'sqlite', 'postgres', 'mariadb'
    dialect: 'sqlite',

    // custom host; default: 127.0.0.1  数据库访问IP，通常127.0.0.1
    host: '127.0.0.1',

    // custom port; default: 3306
    port: 3306,   //数据库访问端口，通常3306

    // use pooling in order to reduce db connection overload and to increase speed
    // currently only for mysql and postgresql (since v1.5.0)
    pool: { //数据库连接池相关配置，为一个对象；
      maxConnections: 10, //最大连接数，默认为 10
      minConnections: 0,  //最小连接数，默认为 0
      maxIdleTime: 30000  //单条链接最大空闲时间，默认为 30000 毫秒
    },

    dialectOptions: {
      // if your server run on full cpu load, please set trace to false 如果您的服务器在满cpu负载下运行，请将trace设置为false
      trace: true,
    },
    //仅对 SQLite 配置有效，数据库地址，默认为 ~/.cnpmjs/data.sqlite
    // the storage engine for 'sqlite'
    // default store into ~/.cnpmjs.org/data.sqlite
    storage: path.join(dataDir, 'data.sqlite'),

    logging: !!process.env.SQL_DEBUG,
  },

  // enable proxy npm audits request or not
  enableNpmAuditsProxy: true,
  //包文件系统处理对象，为一个 Node.js 对象，默认是 fs-cnpm 这个包，并且配置在 ~/.cnpmjs/nfs 目录下，也就是说默认所有同步的包都会被放在这个目录下
  // package tarball store in local filesystem by default 默认情况下，包存储在本地文件系统中
  nfs: require('fs-cnpm')({
    dir: path.join(dataDir, 'nfs')
  }),
  // if set true, will 302 redirect to `nfs.url(dist.key)`
  downloadRedirectToNFS: false,
  // don't check database and just download tgz from nfs
  downloadTgzDontCheckModule: false,
  // remove original tarball when publishing
  unpublishRemoveTarball: true,

  // registry url name
  registryHost: 'r.cnpmjs.org',  

  /**
   * registry mode config  私有模块发布相关配置
   */

  // enable private mode or not  是否开启私有模式，默认为 false
  // private mode: only admins can publish, other users just can sync package from source npm  私有模式下只有管理员能发布模块，其他账号只有同步权限
  // public mode: all users can publish  非私有模式，注册用户都可以发布模块
  enablePrivate: false,

    
   //非管理员发布包的时候只能用以 scopes 里面列举的命名空间为前缀来发布，如果没有设置就无法发布，也就是说这是一个必填项，默认为 [ '@cnpm', '@cnpmtest', '@cnpm-test' ]，据苏千大大解释是为了便于管理以及让公司的员工自觉按需发布；更多关于 NPM scope 的说明请参见 npm-scope
  // registry scopes, if don't set, means do not support scopes
  scopes: [ '@cnpm', '@cnpmtest', '@cnpm-test' ],

  // some registry already have some private packages in global scope  某些注册表在全局范围内已经有一些私有包
  // but we want to treat them as scoped private packages,  但我们希望将它们视为作用域私有包
  // so you can use this white list. 所以可以用这个白名单
  //出于历史包袱的原因，有些已经存在的私有包（可能之前是用 Git 的方式安装的）并没有以命名空间的形式来命名，而这种包本来是无法上传到 CNPM 的，这个配置项数组就是用来加这些例外白名单的，默认为一个空数组
  privatePackages: [],

  /**
   * sync configs  同步源仓库相关设置
   */

  // the official npm registry  npm官方注册
  // cnpm wont directly sync from this one  cnpm不会直接从这个地址同步模块
  // but sometimes will request it for some package infomations 但有时会要求它提供一些package信息
  // please don't change it if not necessary   如果没有必要性的话，请不要更改
  officialNpmRegistry: 'https://registry.npmjs.com',
  officialNpmReplicate: 'https://replicate.npmjs.com',
  cnpmRegistry: 'https://r.cnpmjs.com',

  // sync source, upstream registry  同步源，上游注册表
  // If you want to directly sync from official npm's registry  如果你想直接从官方npm的注册表同步
  // please drop them an email first  首先给他们发邮件
  sourceNpmRegistry: 'https://registry.npm.taobao.org',
  sourceNpmWeb: 'https://npm.taobao.org',

  // upstream registry is base on cnpm/cnpmjs.org or not  上游registry是否是cnpm，默认true
  // if your upstream is official npm registry, please turn it off 若要使用npm官方地址作为同步上游，请设置为false
  sourceNpmRegistryIsCNpm: true,

  // if install return 404, try to sync from source registry 若安装时模块不存在，是否向源registry进行同步，默认true
  syncByInstall: true,

  // sync mode select  同步模式选项
  // none: do not sync any module, proxy all public modules from sourceNpmRegistry
  //none: 不进行同步，只管理用户上传的私有模块，公共模块直接从上游获取
  // exist: only sync exist modules
  //exist: 只同步已经存在于数据库的模块
  // all: sync all modules
   //all: 定时同步所有源registry的模块
  syncModel: 'none', // 'none', 'all', 'exist'

  syncConcurrency: 1,
  // sync interval, default is 10 minutes  同步时间间隔，默认10分钟
  syncInterval: '10m',

  // sync polular modules, default to false
  // because cnpm can't auto sync tag change for now
  // so we want to sync popular modules to ensure their tags
  syncPopular: false,
  syncPopularInterval: '1h',
  // top 100
  topPopular: 100,

  // sync devDependencies or not, default is false 是否同步devDependencies，默认值为fals
  syncDevDependencies: false,
  // try to remove all deleted versions from original registry 尽量从原始注册表中删除所有已删除的版本
  syncDeletedVersions: true,

  // changes streaming sync
  syncChangesStream: false,
  syncDownloadOptions: {
    // formatRedirectUrl: function (url, location)
  },
  handleSyncRegistry: 'http://127.0.0.1:7001',

  // default badge subject
  badgeSubject: 'cnpm',  //包的 badge 显示的名字，默认为 cnpm
  // defautl use https://badgen.net/
  badgeService: {
    url: function(subject, status, options) {
      options = options || {};
      let url = `https://badgen.net/badge/${utility.encodeURIComponent(subject)}/${utility.encodeURIComponent(status)}`;
      if (options.color) {
        url += `/${utility.encodeURIComponent(options.color)}`;
      }
      if (options.icon) {
        url += `?icon=${utility.encodeURIComponent(options.icon)}`;
      }
      return url;
    },
  },

  packagephobiaURL: 'https://packagephobia.now.sh',
  packagephobiaSupportPrivatePackage: false,
  packagephobiaMinDownloadCount: 1000,

  // custom user service, @see https://github.com/cnpm/cnpmjs.org/wiki/Use-Your-Own-User-Authorization
  // when you not intend to ingegrate with your company's user system, then use null, it would
  // use the default cnpm user system
   //用户账号系统接入，可以扩展接入公司的账号系统
  userService: null,

  // always-auth https://docs.npmjs.com/misc/config#always-auth
  // Force npm to always require authentication when accessing the registry, even for GET requests.
    //是否始终需要用户验证，即便是 $ cnpm install 等命令
  alwaysAuth: false,

  // if you're behind firewall, need to request through http proxy, please set this
  // e.g.: `httpProxy: 'http://proxy.mycompany.com:8080'
    //代理地址设置，用于你在墙内源站在墙外的情况
  httpProxy: null,

  // snyk.io root url
  snykUrl: 'https://snyk.io',

  // https://github.com/cnpm/cnpmjs.org/issues/1149
  // if enable this option, must create module_abbreviated and package_readme table in database
  enableAbbreviatedMetadata: false,

  // global hook function: function* (envelope) {}
  // envelope format please see https://github.com/npm/registry/blob/master/docs/hooks/hooks-payload.md#payload
  globalHook: null,

  opensearch: {
    host: '',
  },

  // redis cache
  redisCache: {
    enable: false,
    connectOptions: null,
  },
};

if (process.env.NODE_ENV === 'test') {
  config.enableAbbreviatedMetadata = true;
  config.customRegistryMiddlewares.push(() => {
    return function* (next) {
      this.set('x-custom-middleware', 'true');
      yield next;
    };
  });

  config.customWebMiddlewares.push(() => {
    return function* (next) {
      this.set('x-custom-web-middleware', 'true');
      yield next;
    };
  });
}

if (process.env.NODE_ENV !== 'test') {
  var customConfig;
  if (process.env.NODE_ENV === 'development') {
    customConfig = path.join(root, 'config', 'config.js');
  } else {
    // 1. try to load `$dataDir/config.json` first, not exists then goto 2.
    // 2. load config/config.js, everything in config.js will cover the same key in index.js
    customConfig = path.join(dataDir, 'config.json');
    if (!fs.existsSync(customConfig)) {
      customConfig = path.join(root, 'config', 'config.js');
    }
  }
  if (fs.existsSync(customConfig)) {
    copy(require(customConfig)).override(config);
  }
}

mkdirp.sync(config.logdir);
mkdirp.sync(config.uploadDir);

module.exports = config;

config.loadConfig = function (customConfig) {
  if (!customConfig) {
    return;
  }
  copy(customConfig).override(config);
};
```