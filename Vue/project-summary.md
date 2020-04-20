# 项目总结
## 1.项目结构


- 基础版
> 冗余版的结构在该页最后。

## 2. 项目简介

   项目业务介绍:...
   本项目是在开源库vue-element-admin的基础上改造的后台管理系统。该项目可以通过改变配置（环境变量、router）打包成三种子项目，并且每个项目又可以为多个客户提供定制化打包服务。
   主要技术栈为:
​    框架：vue/vue-router/vuex；  
​    打包：webpack；  
​    HTTP库：axios；  
​    消息推送：websocket；  
​    CSS扩展语言：scss
​    其余主要有：element-ui/echarts/video.js/mockjs；
​    

版本控制相关：
- 版本控制工具为Git
- 使用husky/lint-stage/commitlint控制提交的代码规范及commit记录格式规范


## 3. main.js相关
  #### 1. 自动导入项目中的 filters/directives/components/svgs

  为了减少工作，不用没添加一个组件就import一次，很烦也很乱，需要使用webpack的[require.context](https://webpack.js.org/guides/dependency-management/#require-context)。  
  需要了解的是:
  - require.context有三个参数：
    - directory：说明需要检索的目录
    - useSubdirectories：是否检索子目录
    - regExp: 匹配文件的正则表达式
    
  - require.context的返回值即[context module](https://webpack.js.org/guides/dependency-management/#context-module-api),其有两个方法：
    - resolve：返回值为模块id的函数
    - keys： 返回值为context module可以处理的所有可能请求的模块的数组
    
  - 实际运行时的代码如下，一看便知：
      ```javascript
      var map = {
      	"./index.js": "./src/filters/index.js",
      	"./string.js": "./src/filters/string.js",
      	"./time.js": "./src/filters/time.js"
      };
      
      
      function webpackContext(req) {
      	var id = webpackContextResolve(req);
      	return __webpack_require__(id);
      }
      function webpackContextResolve(req) {
      	var id = map[req];
      	if(!(id + 1)) { // check for number or string
      		var e = new Error("Cannot find module '" + req + "'");
      		e.code = 'MODULE_NOT_FOUND';
      		throw e;
      	}
      	return id;
      }
      webpackContext.keys = function webpackContextKeys() {
      	return Object.keys(map);
      };
      webpackContext.resolve = webpackContextResolve;
      module.exports = webpackContext;
      webpackContext.id = "./src/filters sync recursive .+\\.js$";
      ```

​    

## 4. webpack相关总结

  暂时先总结下用到的webpack的功能特性：
  - 依赖管理:
    - require with expression
    - require.context
    - context module API
    
  - plugins:
    - ProvidePlugin
    - CompressionWebpackPlugin
    - ContextReplacementPlugin
    - webpack-bundle-analyzer
    
  - optimization
    - splitChunks
    - runtimeChunk

  - loader:
    - svg-sprite-loader
    - tunicorn-branch-loader (自定义loader)：
      根据环境变量替换掉项目中导入路径中的关键词，使webpack的导入路径指向期望的路径。
      其实该loader的功能可以使用NormalModuleReplacementPlugin或DefinePlugin代替。
      
    

## 5. axios


## 6. websocket
  [websocket-client](https://github.com/xiaohaifengke/websocket-client)

## 7. video.js
  - 流媒体协议简介
    
    项目中用到了RTMP和HLS两种流媒体协议。
    RTMP用于抓拍机实时监控的功能，主要因为其拥有低延时，支持广的特点。
    HLS协议主要用于视频回放功能，该协议受浏览器支持程度高，包含移动浏览器的支持，但是HLS协议延时较高，所以仅用在了不要求实时性的视频回放的功能上。  
    其实，对于实时监控的功能，之前用的是RTSP协议，该协议最大的缺点是受浏览器支持程度差，web用户需要安装自定义的浏览器插件（IE/Firefoxchrome可以安装VLC插件，chrome不支持），兼容性很差，故此弃用。
    能满足实时播放需求的除了RTMP之外还有HTTP-FLV协议，这两种协议优势相似，但又各有些短板。RTMP协议需要Flash插件支持，脱离Flash插件无法使用。
    而HTTP-FLV可以使用flv.js进行播放，flv.js不依赖Flash或其它用来支持播放的浏览器插件，但是需要依赖HTML5的MSE（Media Source Extensions），而各种浏览器对于MSE的支持程度不同，很可能也会出现兼容性问题。
    同时，很多支持的浏览器也将最大流播放数限制在了6路，无法实现9、16分屏预览需求。结合应用场景及协议特点，项目最终选择使用RTMP协议用于视频直播分发协议。
    
    RTMP协议需要用户安装flash插件，然后可以使用video.js结合videojs-flash库即可播放。
    !> 注意：注意引入利用FLASH控件实现播放FLASH的SWF文件(video-js.swf)，否则视频可能会有较大的延时。
  
  - 主要代码示例

      ```ecmascript 6
      import 'video.js/dist/video-js.min.css'
      import videojs from 'video.js'
      // The actual tech function is registered to video.js automatically; so, there is no need to assign it to a variable.
      require('videojs-flash/dist/videojs-flash.js')
      
      videojs(document.querySelector('.video-js'), {
                flash: {
                  swf: `${process.env.BASE_URL}video-js.swf` // 该swf文件很重要，想达到理想的延时效果，即低延时效果，请自行构建该文件。
                },
                bigPlayButton: false,
                autoplay: true,
                controls: true,
                controlBar: {
                  volumePanel: false,
                  playToggle: false,
                  progressControl: {
                    seekBar: false
                  },
                  remainingTimeDisplay: false
                },
                sources: this.sources
              })
      ```
    ```

  - 构建video-js.swf文件
  
    控制延时的参数主要是`bufferTimeMax`属性，对于该属性的介绍参考这里[用于 Adobe® Flash® Platform 的 ActionScript® 3.0 参考](https://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/flash/net/NetStream.html#bufferTimeMax)。
    使用[video-js-swf](https://github.com/videojs/video-js-swf)这个库可以修改该值然后自己构建swf文件（具体改为何值要自己调试）。

## 8. openlayers

## 9. svg & canvas

## 10. 

## 11. 

## 12. 

?> 附：

- 冗余版
  ```
  |-- tunicorn
      |-- .build-env
      |-- .npmrc (registry=https://registry.npm.taobao.org)
      |-- gulpfile.js
      |-- vue.config.js
      |-- doc
      |-- env
      |   |-- .env.development
      |   |-- README.md
      |   |-- device
      |   |   |-- .env
      |   |   |-- .env.development
      |   |   |-- .env.development.local
      |   |-- dynamic
      |   |   |-- .env
      |   |   |-- .env.development
      |   |   |-- .env.development.local
      |   |-- static
      |       |-- .env
      |       |-- .env.development
      |-- public
      |   |-- config.js
      |   |-- favicon.ico
      |   |-- index.html
      |   |-- video-js.swf (为了减少视频延迟时间)
      |   |-- download
      |   |   |-- usermanual.pdf
      |   |   |-- xx批量增加Excel模板.xlsx
      |   |-- map
      |       |-- china.json
      |-- src
      |   |-- app.vue
      |   |-- caseType.js
      |   |-- constants.js
      |   |-- main.js
      |   |-- permission.js
      |   |-- api
      |   |   |-- ······.js
      |   |-- assets
      |   |   |-- audio
      |   |   |-- icons
      |   |   |   |-- index.js
      |   |   |   |-- svg
      |   |   |       |-- ·····.svg
      |   |   |       |-- menu
      |   |   |           |-- ······.svg
      |   |   |-- images
      |   |       |-- camera.png
      |   |       |-- ···.png
      |   |       |-- device
      |   |       |   |-- default
      |   |       |       |-- logo.png
      |   |       |       |-- nav_logo_layout.png
      |   |       |       |-- project_name_login.png
      |   |       |-- dynamic
      |   |       |   |-- default
      |   |       |       |-- company_logo_login.png
      |   |       |       |-- login_bg.png
      |   |       |       |-- nav_logo_layout.png
      |   |       |       |-- project_name_login.png
      |   |       |-- static
      |   |           |-- default
      |   |               |-- company_logo_login.png
      |   |               |-- login_bg.png
      |   |               |-- project_name_login.png
      |   |-- common
      |   |   |-- base.js
      |   |   |-- utils
      |   |       |-- request.js
      |   |       |-- validate.js
      |   |       |-- websocket.js
      |   |       |-- ·········.js
      |   |-- components
      |   |   |-- index.js
      |   |   |-- TreeSelect
      |   |   |   |-- TreeSelect.vue
      |   |-- config
      |   |   |-- index.js
      |   |   |-- device
      |   |   |   |-- default
      |   |   |   |   |-- router.js
      |   |   |   |-- somewhere (定制)
      |   |   |   |   |-- router.js
      |   |   |-- dynamic
      |   |   |   |-- default
      |   |   |   |   |-- router.js
      |   |   |   |-- somewhere (定制)
      |   |   |   |   |-- router.js
      |   |   |-- static
      |   |   |   |-- default
      |   |   |   |   |-- router.js
      |   |   |   |-- somewhere (定制)
      |   |   |   |   |-- router.js
      |   |-- directives
      |   |   |-- debounce.js
      |   |   |-- enlarge.js
      |   |   |-- index.js
      |   |   |-- useful.js
      |   |-- filters
      |   |   |-- index.js
      |   |   |-- string.js
      |   |   |-- time.js
      |   |-- lang
      |   |   |-- en.js
      |   |   |-- index.js
      |   |   |-- zh.js
      |   |-- loaders
      |   |   |-- tunicorn-branch-loader.js
      |   |-- mixins
      |   |   |-- websocketHandlerMixin.js
      |   |-- mock
      |   |   |-- ·····.js
      |   |-- router
      |   |   |-- create-router.js
      |   |   |-- index.js
      |   |   |-- router-map.js
      |   |-- store
      |   |   |-- index.js
      |   |   |-- modules
      |   |       |-- ···.js
      |   |-- styles
      |   |   |-- ·····.scss
      |   |-- views
      |       |-- monitor
      |       |   |-- monitor.vue
      |       |   |-- components
      |       |   |   |-- ······.vue
      |       |   |-- img
      |       |       |-- ······.png
      |-- tool
          |-- config.js
          |-- util.js
          |-- gulp
              |-- clean.js
              |-- contentPath.js
              |-- document.js
              |-- env.js
              |-- zip.js
  
  ```
