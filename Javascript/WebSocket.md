# WebSocket

## 1. WebSocket协议的连接过程

客户端首先会通过HTTP协议发送一个GET请求，该请求header中有两个必要的字段：`Connection`和`Upgrade`；
同时为防止非WebSocket客户端无意间或由于滥用而请求WebSocket连接，请求头中还会有`Sec-WebSocket-Version`和`Sec-WebSocket-Key`字段。

如果服务器决定升级这次连接，就会返回一个 `101 Switching Protocols` 响应状态码，一个要切换到的协议的头部字段`Upgrade`，和一个`Sec-WebSocket-Accept`
（该值由`Sec-WebSocket-Key`的值计算得出并返回，客户端会验证响应头中Sec-WebSocket-Accept的值，验证通过后才会建立连接。）。
如果服务器没有（或者不能）升级这次连接，它会忽略客户端发送的 `Upgrade` 头部字段，返回一个常规的响应：例如一个`200 OK`.  
WebSocket协议复用了HTTP的握手通道，客户端通过HTTP请求与WebSocket服务端协商升级协议，协议升级完成后，后续的数据交换则遵照WebSocket的协议。
请记住，如果您要使用WebSocket API或任何执行[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)的库打开新连接，则大部分或全部工作都已为您完成。

下面是websocket连接过程的请求头和响应头：
- #### **General**  
  Request URL: ws://172.16.1.78:8001/dynamic-face/api/ws  
  ***Request Method: GET***  
  Status Code: 101 Switching Protocols  
- #### **Response Headers**  
  Cache-Control: no-cache, no-store, max-age=0, must-revalidate  
  ***Connection: upgrade***  
  Date: Thu, 28 May 2020 02:44:12 GMT  
  Expires: 0  
  Pragma: no-cache  
  ***Sec-WebSocket-Accept: F/vzBAMTmLqnRbohHwV8dmZiQXg=***  
  Sec-WebSocket-Extensions: permessage-deflate;client_max_window_bits=15  
  Server: nginx  
  ***Upgrade: websocket***  
  X-Content-Type-Options: nosniff  
  X-Frame-Options: DENY  
  X-XSS-Protection: 1; mode=block  
- #### **Request Headers**  
  Accept-Encoding: gzip, deflate  
  Accept-Language: zh-CN,zh;q=0.9,en;q=0.8  
  Cache-Control: no-cache  
  ***Connection: Upgrade***  
  Host: 172.16.1.78:8001  
  Origin: http://172.16.1.78:8001  
  Pragma: no-cache  
  Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits  
  ***Sec-WebSocket-Key: tSk8u0bDyOJbvL1PMPMUpA==***  
  ***Sec-WebSocket-Version: 13***  
  ***Upgrade: websocket***  
  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36

其中有几个重要的字段：

**Connection:** Connection必须设置为Upgrade，表示客户端希望连接升级。  
**Upgrade:** Upgrade必须设置为WebSocket，表示在取得服务器响应之后，使用HTTP升级将HTTP协议转换(升级)为WebSocket协议。  
**Sec-WebSocket-key:** 向服务器提供所需的信息，以确认客户端有权请求升级到WebSocket。
当不安全的（HTTP）客户端希望升级时，可以使用此标头，以提供一定程度的保护以防止滥用。
密钥的值使用WebSocket规范中定义的算法计算，因此不提供安全性。
相反，它有助于防止非WebSocket客户端无意间或由于滥用而请求WebSocket连接。
因此，从本质上讲，此密钥只是确认“是的，我的意思是打开WebSocket连接”。
> 此标头由选择使用它的客户端自动添加；不能使用XMLHttpRequest.setRequestHeader()方法添加。

`Sec-WebSocket-key`的值是该次请求升级的密钥。如果客户端愿意，可以添加它，并且服务器将在响应中包含它自己的密钥，在将升级响应提供给用户之前，客户端将对其进行验证。

服务器的响应的`Sec-WebSocket-Accept`的值是基于该`Sec-WebSocket-key`的值计算出来的。

**Sec-WebSocket-Version:** 指定客户端希望使用的WebSocket协议版本，以便服务器可以在其端确认是否支持该版本。WebSocket协议的最新最终版本是版本13。

如果服务器无法使用指定版本的WebSocket协议进行通信，它将以错误（例如426 Upgrade Required）响应，
并且该响应头中的`Sec-WebSocket-Version`字段列出了以逗号分隔的受支持协议版本的列表。
如果服务器确实支持请求的协议版本，则响应头中不包含`Sec-WebSocket-Version`字段。

**Sec-WebSocket-Accept:** 当服务器愿意启动WebSocket连接时，在打开握手过程中来自服务器的响应消息中将包含该消息。该值是基于该`Sec-WebSocket-key`的值计算出来的hash值。  
**HTTP/1.1 101 Switching Protocols:** 101状态码表示升级协议，在返回101状态码后，HTTP协议完成工作，转换为WebSocket协议。此时就可以进行全双工双向通信了。

## 2. WebSocket API
WebSocket 对象提供了用于创建和管理 WebSocket 连接，以及可以通过该连接发送和接收数据的 API。

使用 WebSocket() 构造函数来构造一个 WebSocket 。

### 构造函数

`WebSocket(url[, protocols])`   返回一个 WebSocket 对象。

### 常量
|Constant|Value(Number)|
| ---- | ---- |
|`WebSocket.CONNECTING`|0|
|`WebSocket.OPEN`|1|
|`WebSocket.CLOSING`|2|
|`WebSocket.CLOSED`|3|

### 属性
`WebSocket.binaryType`
使用二进制的数据类型连接。  
`WebSocket.bufferedAmount` **只读**
未发送至服务器的字节数。  
`WebSocket.extensions` **只读**
服务器选择的扩展。  
`WebSocket.onclose`
用于指定连接关闭后的回调函数。  
`WebSocket.onerror`
用于指定连接失败后的回调函数。  
`WebSocket.onmessage`
用于指定当从服务器接受到信息时的回调函数。  
`WebSocket.onopen`
用于指定连接成功后的回调函数。  
`WebSocket.protocol` **只读**
服务器选择的下属协议。  
`WebSocket.readyState` **只读**
当前的链接状态。  
`WebSocket.url` **只读**
WebSocket 的绝对路径。

### 方法
`WebSocket.close([code[, reason]])`
关闭当前链接。  
`WebSocket.send(data)`
对要传输的数据进行排队。

### 事件
使用 `addEventListener()` 或将一个事件监听器赋值给本接口的 `oneventname` 属性，来监听下面的事件。

`close`
当一个 WebSocket 连接被关闭时触发。  
`error`
当一个 WebSocket 连接因错误而关闭时触发，例如无法发送数据时。  
`message`
当通过 WebSocket 收到数据时触发。  
`open`
当一个 WebSocket 连接成功时触发。  

## 3. 常见的功能扩展

- 心跳机制
  
  浏览器不会帮我们维持连接，当在一段时间内没有和服务端进行通信的话，浏览器会自动断开连接。
  > 通过修改nginx配置中的 location =/ws 里的 proxy_read_timeout 配置保持连接的时长，但该值不宜设置过大。
  > 如：proxy_read_timeout 100s;
- 异常断开时自动重连

  WebSocket连接被关闭时会触发`close`事件, 该事件的参数`CloseEvent`中的字段可以反应断开原因。

  - `CloseEvent.code`: **只读** 返回一个 unsigned short 类型的数字, 表示服务端发送的关闭码, 以下为已分配的状态码。
    
    |**状态码**|	**名称**|	**描述**|
    |---- |	---- | ----|
    |0–999|	 	|**保留段, 未使用.**|
    |1000|	CLOSE_NORMAL	|正常关闭; 无论为何目的而创建, 该链接都已成功完成任务.|
    |1001|	CLOSE_GOING_AWAY	|终端离开, 可能因为服务端错误, 也可能因为浏览器正从打开连接的页面跳转离开.|
    |1002|	CLOSE_PROTOCOL_ERROR	|由于协议错误而中断连接.|
    |1003|	CLOSE_UNSUPPORTED	|由于接收到不允许的数据类型而断开连接 (如仅接收文本数据的终端接收到了二进制数据).|
    |1004|	 	|**保留**. 其意义可能会在未来定义.|
    |1005|	CLOSE_NO_STATUS	|**保留**. 表示没有收到预期的状态码.|
    |1006|	CLOSE_ABNORMAL	|**保留**. 用于期望收到状态码时连接非正常关闭 (也就是说, 没有发送关闭帧).|
    |1007|	Unsupported Data	|由于收到了格式不符的数据而断开连接 (如文本消息中包含了非 UTF-8 数据).|
    |1008|	Policy Violation	|由于收到不符合约定的数据而断开连接. 这是一个通用状态码, 用于不适合使用 1003 和 1009 状态码的场景.|
    |1009|	CLOSE_TOO_LARGE	|由于收到过大的数据帧而断开连接.|
    |1010|	Missing Extension	|客户端期望服务器商定一个或多个拓展, 但服务器没有处理, 因此客户端断开连接.|
    |1011|	Internal Error	|客户端由于遇到没有预料的情况阻止其完成请求, 因此服务端断开连接.|
    |1012|	Service Restart	|服务器由于重启而断开连接.|
    |1013|	Try Again Later	|服务器由于临时原因断开连接, 如服务器过载因此断开一部分客户端连接.|
    |1014|	 	|**由 WebSocket标准保留以便未来使用.**|
    |1015|	TLS Handshake	|**保留.** 表示连接由于无法完成 TLS 握手而关闭 (例如无法验证服务器证书).|
    |1016–1999|	 	|**由 WebSocket标准保留以便未来使用.**|
    |2000–2999|	 	|**由 WebSocket拓展保留使用.**|
    |3000–3999|	 	|可以由库或框架使用.? **不应**由应用使用. 可以在 IANA 注册, 先到先得.|
    |4000–4999|	 	|可以由应用使用.|
  
  - `CloseEvent.reason`: **只读** 返回一个 `DOMString` 用以表示服务器关闭连接的原因. 这是由服务器和子协议决定的.
  - `CloseEvent.wasClean`: **只读** 返回一个 `Boolean` 用以表示连接是否正常断开，是布尔值。一般异常断开时，该值为false
  
  在断开时判断`CloseEvent.wasClean`，如果为 `false` 则重新连接。
  
- 当和服务端建立连接失败时，可以指定自动重连次数和连接的时间间隔

  该功能可以防止受网络波动等原因影响，在未来的某个时刻再自动重新连接。
  为减少短时间内多次重连的情况，可以在刚端口时立刻重连一次，如不能正常连接，则在一段时间后再重新连接，而不是立刻再次连接。
  
## 4. 封装一个简易版的websocket库

  ```javascript
  const defaultOptions = {
    connectImmediately: true,
    enableDefaultEventHandler: true,
    connectLogSilent: false,
    eventLogSilent: false,
    maxReconnectTimes: 3,
    reconnectTimeInterval: 30000,
    immediateReconnectTimeInterval: 2000,
    enableMessageCache: false,
    message: 'message',
    heartbeatPeriod: 50000,
    heartbeatMessage: 'ping',
    heartbeatLogSilent: false
  }
  
  class WebSocketHelper {
    static STATUS = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']
  
    /**
     * WebSocketClient constructor
     * @param { string }  url
     * @param { object | undefined }  options
     */
    constructor (url, options = {}) {
      this.url = url
      this.options = options
      this.defaultOptions = { ...defaultOptions }
      this.$options = { ...this.defaultOptions, ...options }
      this.wasClean = null // Boolean. 是否正常断开。一般异常断开时，该值为false
      this.reconnectTimes = 0 // 第n次重连的flag
      this._messageCache = []
      if (this.$options.connectImmediately) this.createWebSocket()
      this.heartbeat = new Heartbeat(this, {
        message: this.$options.heartbeatMessage,
        period: this.$options.heartbeatPeriod
      })
      this._init()
    }
  
    createWebSocket () {
      if ('WebSocket' in window) {
        if (this.readyState === undefined || this.readyState === WebSocket.CLOSED) {
          this.ws = new WebSocket(this.url)
          if (this.$options.enableDefaultEventHandler) this.initEventsHandler()
        }
      } else {
        console.log('WebSocket is not supported in your browser!')
      }
    }
  
    reconnectWebSocket (times = 0, interval = this.$options.reconnectTimeInterval) {
      if (times < this.$options.maxReconnectTimes) {
        if (!this.$options.connectLogSilent) {
          console.log(`Try to reconnect the WebSocket after ${interval / 1000} seconds.`)
        }
        setTimeout(
          t => {
            if (!this.$options.connectLogSilent) {
              console.log(`${t + 1}th attempt to reconnect to webSocket server.`)
            }
            this.reconnectTimes++
            this.createWebSocket()
          },
          interval,
          times
        )
      } else {
        if (!this.$options.connectLogSilent) {
          console.error(
            `Could not create connection to websocket server. Attempted reconnect ${this.$options.maxReconnectTimes} times. Giving up!`
          )
        }
      }
    }
  
    initEventsHandler () {
      this.ws.addEventListener('open', () => {
        if (!this.$options.eventLogSilent) {
          console.log(`The Websocket has opened at ${getTime()}.`)
        }
        this.wasClean = null
        this.reconnectTimes = 0
        this.heartbeat.recheck()
        this.sendCachedMessage()
      })
      this.ws.addEventListener('message', event => {
        this.heartbeat.recheck()
        const data = JSON.parse(event.data)
        if (isPlainObject(data)) {
          const message = this.$options.message
          const eventName = data[message]
          eventName && typeof eventName === 'string' && this.trigger(eventName, data)
        }
      })
      this.ws.addEventListener('close', event => {
        this.wasClean = !!event.wasClean
        if (this.wasClean) {
          if (!this.$options.eventLogSilent) {
            console.log(`The WebSocket connection has been closed normally at ${getTime()}.`, event)
          }
        } else {
          if (!this.$options.eventLogSilent) {
            console.error(`closed at ${getTime()}.`, event)
          }
          this.reconnectWebSocket(
            this.reconnectTimes,
            this.reconnectTimes > 0
              ? this.$options.reconnectTimeInterval
              : this.$options.immediateReconnectTimeInterval
          )
        }
        this.heartbeat.stopCheck()
      })
      this.ws.addEventListener('error', error => {
        if (!this.$options.eventLogSilent) {
          console.error(
            `The WebSocket connection has been closed due to an error at ${getTime()}.`,
            error
          )
        }
      })
    }
  
    cacheMessage (message) {
      const index = this._messageCache.indexOf(message)
      if (index === -1) {
        this._messageCache.push(message)
      }
    }
  
    sendCachedMessage () {
      if (this._messageCache.length === 0) return
      const msg = this._messageCache.shift()
      this.send(msg)
      setTimeout(() => {
        this.sendCachedMessage()
      }, 100)
    }
  
    /**
     * 1. 判断当前websocket的连接状态为OPEN状态时发送消息
     * 2. TODO: 当非OPEN状态时，判断是否为正常断开。只有当websocket为异常断开时，才存储信息
     * 3. FIXME: 某些早期浏览器不支持readyState属性，故该方法内的逻辑应该添加相应的判断
     * @param { object } message
     */
    send (message) {
      switch (this.readyState) {
        case undefined: {
  
          /**
           * WebSocket is not instantiated. Store the message to the messageCache
           * and send it after the WebSocket open. Then invoke the createWebSocket method.
           *
           */
          if (message !== this.$options.heartbeatMessage && this.$options.enableMessageCache) {
            this.cacheMessage(message)
          }
          this.createWebSocket()
          break
        }
        case WebSocket.CONNECTING: {
  
          /**
           * WebSocket is connecting. Store the message to the messageCache
           * and send it after the WebSocket open.
           *
           */
          if (message !== this.$options.heartbeatMessage && this.$options.enableMessageCache) {
            this.cacheMessage(message)
          }
          break
        }
  
        case WebSocket.OPEN: {
          // WebSocket is connected and send the message directly.
          if (message === this.$options.heartbeatMessage) {
            console.log(`Heartbeat check at ${getTime()}.`)
            break
          }
  
          const index = this._messageCache.indexOf(message)
          if (index !== -1) {
            // 如果该msg在messageCache内，则从messageCache中删除该msg
            this._messageCache.splice(index, 1)
          }
          if (
            message instanceof Blob ||
            message instanceof ArrayBuffer ||
            isArrayBufferView(message)
          ) {
            this.ws.send(message)
          } else {
            this.ws.send(JSON.stringify(message))
          }
          break
        }
        default: {
  
          /**
           * TODO: Do not store the message if this.wasClean is true
           * Store the message to the messageCache
           * and send it after the WebSocket is reconnected.
           */
          if (message !== this.$options.heartbeatMessage && this.$options.enableMessageCache) {
            this.cacheMessage(message)
          }
        }
      }
    }
  
    /**
     * TODO:
     * It may be helpful to examine the socket's bufferedAmount attribute before attempting to
     * close the connection to determine if any data has yet to be transmitted on the network.
     * If this value isn't 0, there's pending data still, so you may wish to wait before closing the connection.
     */
    close (...args) {
      this.ws?.close(...args)
    }
  
    _init () {
      Object.defineProperties(this, {
        readyState: {
          enumerable: true,
          get: function () {
            return this.ws?.readyState
          }
        },
        status: {
          enumerable: true,
          get: function () {
            return this.readyState >= 0 ? this.constructor.STATUS[this.readyState] : 'UNCREATE'
          }
        },
        onopen: {
          enumerable: true,
          get: function () {
            return this.ws?.onopen
          },
          set: function (fn) {
            this.ws && (this.ws.onopen = fn)
          }
        },
        onmessage: {
          enumerable: true,
          get: function () {
            return this.ws?.onmessage
          },
          set: function (fn) {
            this.ws && (this.ws.onmessage = fn)
          }
        },
        onclose: {
          enumerable: true,
          get: function () {
            return this.ws?.onclose
          },
          set: function (fn) {
            this.ws && (this.ws.onclose = fn)
          }
        },
        onerror: {
          enumerable: true,
          get: function () {
            return this.ws?.onerror
          },
          set: function (fn) {
            this.ws && (this.ws.onerror = fn)
          }
        }
      })
    }
  
    on (event, func) {
      if (!this._events) this._events = Object.create(null)
      if (Array.isArray(event)) {
        for (let i = 0, l = event.length; i < l; i++) {
          this.on(event[i], func)
        }
      } else {
        ;(this._events[event] || (this._events[event] = [])).push(func)
      }
      return this
    }
  
    once (event, func) {
      const $this = this
  
      function once () {
        $this.off(event, once)
        func.apply($this, arguments)
      }
  
      once.func = func
      this.on(event, once)
      return this
    }
  
    off (event, func) {
      // all
      if (!arguments.length) {
        this._events = Object.create(null)
        return this
      }
      // array of events
      if (Array.isArray(event)) {
        for (let i = 0, l = event.length; i < l; i++) {
          this.off(event[i], func)
        }
        return this
      }
      // specific event
      const cbs = this._events[event]
      if (!cbs) {
        return this
      }
      if (!func) {
        this._events[event] = null
        return this
      }
      // specific handler
      let cb
      let i = cbs.length
      while (i--) {
        cb = cbs[i]
        if (cb === func || cb.func === func) {
          cbs.splice(i, 1)
          break
        }
      }
      return this
    }
  
    trigger (event, ...args) {
      let cbs = this._events[event]
      if (cbs) {
        cbs = [...cbs]
        let res
        for (let i = 0, l = cbs.length; i < l; i++) {
          try {
            res = cbs[i].apply(this, args)
            if (res && isPromise(res) && !res._handled) {
              res.catch(e => console.error(e))
              res._handled = true
            }
          } catch (e) {
            console.error(e)
          }
        }
      }
      return this
    }
  }
  
  class Heartbeat {
    constructor (ws, options = {}) {
      const defaultOptions = {
        message: 'ping',
        period: 50000
      }
      this.ws = ws
      this.options = { ...defaultOptions, ...options }
      this.checkIntervalId = null
    }
  
    check () {
      this.checkIntervalId = setInterval(() => {
        this.ws.send(this.options.message)
      }, this.options.period)
    }
  
    stopCheck () {
      clearInterval(this.checkIntervalId)
      this.checkIntervalId = null
    }
  
    recheck () {
      this.stopCheck()
      this.check()
    }
  }
  
  /**
   * Get the raw type string of a value, e.g., [object Object].
   */
  const _toString = Object.prototype.toString
  
  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]'
  }
  
  function isPromise (p) {
    return (
      p !== undefined && p !== null && typeof p.then === 'function' && typeof p.catch === 'function'
    )
  }
  
  function isArrayBufferView (obj) {
    return (
      obj instanceof Int8Array ||
      obj instanceof Uint8Array ||
      obj instanceof Uint8ClampedArray ||
      obj instanceof Int16Array ||
      obj instanceof Uint16Array ||
      obj instanceof Int32Array ||
      obj instanceof Uint32Array ||
      obj instanceof Float32Array ||
      obj instanceof Float64Array ||
      obj instanceof DataView
    )
  }
  
  function getTime () {
    const d = new Date()
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const date = d.getDate()
    const hour = d.getHours()
    const minute = d.getMinutes()
    const second = d.getSeconds()
    return `${year}-${f(month)}-${f(date)} ${f(hour)}:${f(minute)}:${f(second)}`
  
    function f (num) {
      return num > 9 ? num : '0' + num
    }
  }
  ```

<br/>

参考:  
 - [Protocol upgrade mechanism](https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism)
 - [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
