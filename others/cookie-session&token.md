# 前端鉴权（Cookie/Session、Token和OAuth）

前后端未分离以前，页面都是通过后台来渲染的，能不能访问到页面直接由后台逻辑判断。前后端分离以后，页面的元素由页面本身来控制，所以页面间的路由是由前端来控制了。当然，仅有前端做权限控制是远远不够的，后台还需要对每个接口做验证。
  为什么前端做权限控制是不够的呢？因为前端的路由控制仅仅是视觉上的控制，前端可以隐藏某个页面或者某个按钮，但是发送请求的方式还是有很多，完全可以跳过操作页面来发送某个请求。所以就算前端的权限控制做的非常严密，后台依旧需要验证每个接口。
  前端的权限控制主要有三种：路由控制（路由的跳转）、视图控制（按钮级别）和请求控制（请求拦截器）。这几种方式之后再详谈，前端做完权限控制，后台还是需要验证每一个接口，这就是鉴权。现在前后端配合鉴权的方式主要有以下几种：

1. session-cookie
2. Token 验证(JWT)
3. OAuth(开放授权)

### session-cookie

#### cookie

  Http协议是一个无状态的协议，服务器不会知道到底是哪一台浏览器访问了它，因此需要一个标识用来让服务器区分不同的浏览器。cookie就是这个管理服务器与客户端之间状态的标识。
  cookie的原理是，浏览器第一次向服务器发送请求时，服务器在response头部设置Set-Cookie字段，浏览器收到响应就会设置cookie并存储，在下一次该浏览器向服务器发送请求时，就会在request头部自动带上Cookie字段，服务器端收到该cookie用以区分不同的浏览器。当然，这个cookie与某个用户的对应关系应该在第一次访问时就存在服务器端，这时就需要session了。

```
const http = require('http')
http.createServer((req, res) => {
  if (req.url === '/favicon.ico') {
    return
  } else {
    res.setHeader('Set-Cookie', 'name=zhunny')
    res.end('Hello Cookie')
  }
}).listen(3000) 
复制代码
```

#### session

  session是会话的意思，浏览器第一次访问服务端，服务端就会创建一次会话，在会话中保存标识该浏览器的信息。它与cookie的区别就是session是缓存在服务端的，cookie 则是缓存在客户端，他们都由服务端生成，为了弥补Http协议无状态的缺陷。

#### session-cookie认证

1. 服务器在接受客户端首次访问时在服务器端创建seesion，然后保存seesion(我们可以将seesion保存在 内存中，也可以保存在redis中，推荐使用后者)，然后给这个session生成一个唯一的标识字符串,然后在 响应头中种下这个唯一标识字符串。

2. 签名。这一步通过秘钥对sid进行签名处理，避免客户端修改sid。(非必需步骤)

3. 浏览器中收到请求响应的时候会解析响应头，然后将sid保存在本地cookie中，浏览器在下次http请求的 请求头中会带上该域名下的cookie信息。

4. 服务器在接受客户端请求时会去解析请求头cookie中的sid，然后根据这个sid去找服务器端保存的该客 户端的session，然后判断该请求是否合法。

   ![session-cookie](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/12/16b49ecef3e6bfd8~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)

```
const http = require('http')
//此时session存在内存中
const session = {}
http.createServer((req, res) => {
  const sessionKey = 'sid'
  if (req.url === '/favicon.ico') {
    return
  } else {
    const cookie = req.headers.cookie
    //再次访问，对sid请求进行认证
    if (cookie && cookie.indexOf(sessionKey) > -1) {
      res.end('Come Back')
    }
    //首次访问，生成sid，保存在服务器端
    else {
      const sid = (Math.random() * 9999999).toFixed()
      res.setHeader('Set-Cookie', `${sessionKey}=${sid}`)
      session[sid] = { name: 'zhunny' }
      res.end('Hello Cookie')
    }
  }
}).listen(3000)
复制代码
```

#### redis

  redis是一个键值服务器，可以专门放session的键值对。如何在koa中使用session:

```
const koa = require('koa')
const app = new koa()
const session = require('koa-session')

const redisStore = require('koa-redis')
const redis = require('redis')
const redisClient = redis.createClient(6379, 'localhost')

const wrapper = require('co-redis')
const client = wrapper(redisClient)

//加密sessionid
app.keys = ['session secret']

const SESS_CONFIG = {
  key: 'kbb:sess',
  //此时让session存储在redis中
  store: redisStore({ client })
}

app.use(session(SESS_CONFIG, app))

app.use(ctx => {
  //查看redis中的内容
  redisClient.keys('*', (errr, keys) => {
    console.log('keys:', keys)
    keys.forEach(key => {
      redisClient.get(key, (err, val) => {
        console.log(val)
      })
    })
  })
  if (ctx.path === '/favicon.ico') return
  let n = ctx.session.count || 0
  ctx.session.count = ++n
  ctx.body = `第${n}次访问`
})

app.listen(3000)
复制代码
```

#### 用户登录认证

  使用session-cookie做登录认证时，登录时存储session，退出登录时删除session，而其他的需要登录后才能操作的接口需要提前验证是否存在session，存在才能跳转页面，不存在则回到登录页面。
  在koa中做一个验证的中间件，在需要验证的接口中使用该中间件。

```
//前端代码
async login() {
    await axios.post('/login', {
        username: this.username,
        password: this.password
    })
},
async logout() {
    await axios.post('/logout')
},
async getUser() {
    await axios.get('/getUser')
}
复制代码
//中间件 auth.js
module.exports = async (ctx, next) => {
  if (!ctx.session.userinfo) {
    ctx.body = {
      ok: 0,
      message: "用户未登录" };
  } else {
    await next();
} };
//需要验证的接口
router.get('/getUser', require('auth'), async (ctx) => {
  ctx.body = {
    message: "获取数据成功",
    userinfo: ctx.session.userinfo
  }
})
//登录
router.post('/login', async (ctx) => {
  const {
    body
  } = ctx.request
  console.log('body', body)
  //设置session
  ctx.session.userinfo = body.username;
  ctx.body = {
    message: "登录成功"
  }
})
//登出
router.post('/logout', async (ctx) => {
  //设置session
  delete ctx.session.userinfo
  ctx.body = {
    message: "登出系统"
  }
})
复制代码
```

### Token

  token是一个令牌，浏览器第一次访问服务端时会签发一张令牌，之后浏览器每次携带这张令牌访问服务端就会认证该令牌是否有效，只要服务端可以解密该令牌，就说明请求是合法的，令牌中包含的用户信息还可以区分不同身份的用户。一般token由用户信息、时间戳和由hash算法加密的签名构成。

#### Token认证流程

1. 客户端使用用户名跟密码请求登录
2. 服务端收到请求，去验证用户名与密码
3. 验证成功后，服务端会签发一个 Token，再把这个 Token 发送给客户端
4. 客户端收到 Token 以后可以把它存储起来，比如放在 Cookie 里或者 Local Storage 里
5. 客户端每次向服务端请求资源的时候需要带着服务端签发的 Token
6. 服务端收到请求，然后去验证客户端请求里面带着的 Token（request头部添加Authorization），如果验证成功，就向客户端返回请求的数据，如果不成功返回401错误码，鉴权失败。

#### Token和session的区别

1. session-cookie的缺点：（1）认证方式局限于在浏览器中使用，cookie是浏览器端的机制，如果在app端就无法使用cookie。（2）为了满足全局一致性，我们最好把session存储在redis中做持久化，而在分布式环境下，我们可能需要在每个服务器上都备份，占用了大量的存储空间。（3）在不是Https协议下使用cookie，容易受到CSRF跨站点请求伪造攻击。
2. token的缺点：（1）加密解密消耗使得token认证比session-cookie更消耗性能。（2）token比sessionId大，更占带宽。
3. 两者对比，它们的区别显而易见：（1）token认证不局限于cookie，这样就使得这种认证方式可以支持多种客户端，而不仅是浏览器。且不受同源策略的影响。（2）不使用cookie就可以规避CSRF攻击。（3）token不需要存储，token中已包含了用户信息，服务器端变成无状态，服务器端只需要根据定义的规则校验这个token是否合法就行。这也使得token 的可扩展性更强。

#### JWT（JSON Web Token）

  JWT 的原理是，服务器认证以后，生成一个 JSON 对象，这个JSON对象肯定不能裸传给用户，那谁都可以篡改这个对象发送请求。因此这个JSON对象会被服务器端签名加密后返回给用户，返回的内容就是一张令牌，以后用户每次访问服务器端就带着这张令牌。
  这个JSON对象可能包含的内容就是用户的信息，用户的身份以及令牌的过期时间。

##### JWT的组成部分

  在该网站[JWT](https://link.juejin.cn?target=https%3A%2F%2Fjwt.io)，可以解码或编码一个JWT。一个JWT形如：

![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/12/16b4b35d06740f92~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)


  它由三部分组成：Header（头部）、Payload（负载）、Signature（签名）。



1. Header部分是一个JSON对象，描述JWT的元数据。一般描述信息为该Token的加密算法以及Token的类型。`{"alg": "HS256","typ": "JWT"}`的意思就是，该token使用HS256加密，token类型是JWT。这个部分基本相当于明文，它将这个JSON对象做了一个Base64转码，变成一个字符串。Base64编码解码是有算法的，解码过程是可逆的。头部信息默认携带着两个字段。
2. Payload 部分也是一个 JSON 对象，用来存放实际需要传递的数据。有7个官方字段，还可以在这个部分定义私有字段。一般存放用户名、用户身份以及一些JWT的描述字段。它也只是做了一个Base64编码，因此肯定不能在其中存放秘密信息，比如说登录密码之类的。
3. Signature是对前面两个部分的签名，防止数据篡改，如果前面两段信息被人修改了发送给服务器端，此时服务器端是可利用签名来验证信息的正确性的。签名需要密钥，密钥是服务器端保存的，用户不知道。算出签名以后，把 Header、Payload、Signature 三个部分拼成一个字符串，每个部分之间用"点"（.）分隔，就可以返回给用户。

##### JWT的特点

1. JWT 默认是不加密，但也是可以加密的。生成原始 Token 以后，可以用密钥再加密一次。
2. JWT 不加密的情况下，不能将秘密数据写入 JWT。
3. JWT 不仅可以用于认证，也可以用于交换信息。有效使用 JWT，可以降低服务器查询数据库的次数。
4. JWT 的最大缺点是，由于服务器不保存 session 状态，因此无法在使用过程中废止某个 token，或者更改 token 的权限。也就是说，一旦 JWT 签发了，在到期之前就会始终有效，除非服务器部署额外的逻辑。
5. JWT 本身包含了认证信息，一旦泄露，任何人都可以获得该令牌的所有权限。为了减少盗用，JWT 的有效期应该设置得比较短。对于一些比较重要的权限，使用时应该再次对用户进行认证。
6. 为了减少盗用，JWT 不应该使用 HTTP 协议明码传输，要使用 HTTPS 协议传输。

##### JWT验证用户登录

```
//前端代码
//axios的请求拦截器，在每个request请求头上加JWT认证信息
axios.interceptors.request.use(
    config => {
        const token = window.localStorage.getItem("token");
        if (token) {
        // 判断是否存在token，如果存在的话，则每个http header都加上token
        // Bearer是JWT的认证头部信息
            config.headers.common["Authorization"] = "Bearer " + token;
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);
//登录方法：在将后端返回的JWT存入localStorage
async login() {
    const res = await axios.post("/login-token", {
        username: this.username,
        password: this.password
    });
    localStorage.setItem("token", res.data.token);
},
//登出方法：删除JWT
async logout() {
    localStorage.removeItem("token");
},
async getUser() {
    await axios.get("/getUser-token");
}
复制代码
//后端代码
const jwt = require("jsonwebtoken");
const jwtAuth = require("koa-jwt");
//用来签名的密钥
const secret = "it's a secret";

router.post("/login-token", async ctx => {
  const { body } = ctx.request;
  //登录逻辑，略，即查找数据库，若该用户和密码合法，即将其信息生成一个JWT令牌传给用户
  const userinfo = body.username;
  ctx.body = {
    message: "登录成功",
    user: userinfo,
    // 生成 token 返回给客户端
    token: jwt.sign(
      {
        data: userinfo,
        // 设置 token 过期时间，一小时后，秒为单位
        exp: Math.floor(Date.now() / 1000) + 60 * 60
      },
      secret
    )
  };
});

//jwtAuth这个中间件会拿着密钥解析JWT是否合法。
//并且把JWT中的payload的信息解析后放到state中，ctx.state用于中间件的传值。
router.get(
  "/getUser-token",
  jwtAuth({
    secret
  }),
  async ctx => {
    // 验证通过，state.user
    console.log(ctx.state.user);
    ctx.body = {
      message: "获取数据成功",
      userinfo: ctx.state.user.data 
    };
  }
)
//这种密码学的方式使得token不需要存储，只要服务端能拿着密钥解析出用户信息，就说明该用户是合法的。
//若要更进一步的权限验证，需要判断解析出的用户身份是管理员还是普通用户。
复制代码
```

### OAuth

  三方登入主要基于OAuth 2.0。OAuth协议为用户资源的授权提供了一个安全的、开放而又简易的标 准。与以往的授权方式不同之处是OAuth的授权不会使第三方触及到用户的帐号信息(如用户名与密码)， 即第三方无需使用用户的用户名与密码就可以申请获得该用户资源的授权，因此OAuth是安全的。我们常见的提供OAuth认证服务的厂商有支付宝、QQ、微信。这样的授权方式使得用户使用门槛低，可以更好的推广自己的应用。
  OAuth相关文章推荐阮一峰老师的一系列文章[OAuth 2.0 ](https://link.juejin.cn?target=http%3A%2F%2Fwww.ruanyifeng.com%2Fblog%2F2019%2F04%2Foauth_design.html)。

#### OAuth认证流程

  OAuth就是一种授权机制。数据的所有者告诉系统，同意授权第三方应用进入系统，获取这些数据。系统从而产生一个短期的进入令牌（token），用来代替密码，供第三方应用使用。
  OAuth有四种获取令牌的方式，不管哪一种授权方式，第三方应用申请令牌之前，都必须先到系统备案，说明自己的身份，然后会拿到两个身份识别码：客户端 ID（client ID）和客户端密钥（client secret）。这是为了防止令牌被滥用，没有备案过的第三方应用，是不会拿到令牌的。
  在前后端分离的情境下，我们常使用授权码方式，指的是第三方应用先申请一个授权码，然后再用该码获取令牌。

##### GitHub第三方登录示例

  我们用例子来理清授权码方式的流程。

1. 在GitHub中备案第三方应用，拿到属于它的客户端ID和客户端密钥。

  在github-settings-developer settings中创建一个OAuth App。并填写相关内容。填写完成后Github会给你一个客户端ID和客户端密钥。

![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/13/16b4ec2927416360~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)





![img](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/13/16b4ec65ac38384a~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)


 \2. 此时在你的第三方网站就可以提供一个Github登录链接，用户点击该链接后会跳转到Github。这一步拿着客户端ID向Github请求授权码code。



```
const config = {
  client_id: '28926186082164bbea8f',
  client_secret: '07c4fdae1d5ca458dae3345b6d77a0add5a785ca'
}

router.get('/github/login', async (ctx) => {
  var dataStr = (new Date()).valueOf();
  //重定向到认证接口,并配置参数
  var path = "https://github.com/login/oauth/authorize";
  path += '?client_id=' + config.client_id;

  //转发到授权服务器
  ctx.redirect(path);
})
复制代码
```

1. 用户跳转到Github，输入Github的用户名密码，表示用户同意使用Github身份登录第三方网站。此时就会带着授权码code跳回第三方网站。跳回的地址在创建该OAuth时已经设置好了。`http://localhost:3000/github/callback`
2. 第三方网站收到授权码，就可以拿着授权码、客户端ID和客户端密钥去向Github请求access_token令牌。
3. Github收到请求，向第三方网站颁发令牌。
4. 第三方网站收到令牌，就可以暂时拥有Github一些请求的权限，比如说拿到用户信息，拿到这个用户信息之后就可以构建自己第三方网站的token，做相关的鉴权操作。

```
router.get('/github/callback', async (ctx) => {
  console.log('callback..')
  const code = ctx.query.code;
  const params = {
    client_id: config.client_id,
    client_secret: config.client_secret,
    code: code
  }
  let res = await axios.post('https://github.com/login/oauth/access_token', params)
  const access_token = querystring.parse(res.data).access_token
  res = await axios.get('https://api.github.com/user?access_token=' + access_token)
  console.log('userAccess:', res.data)
  ctx.body = `
        <h1>Hello ${res.data.login}</h1>
        <img src="${res.data.avatar_url}" alt=""/>
    `

})
```


作者：zhunny
链接：https://juejin.cn/post/6844903864458543111
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。