# SIMPLE-PWA
本项目是pwa搭载在vue的示例项目，pwa是一个渐进式web应用概念，不依赖任何框架，vue只是一个实现载体。

## 概念
[Progressive Web Apps](https://developer.mozilla.org/zh-CN/Apps/Progressive "pwa") 是渐进式Web应用程序，运行在现代浏览器并展现出超级能力。支持可发现，可安装，离线运行，消息推送等APP特有的能力，本项目以最简单的方式封装了以上功能。

## demo
![pwa example](./static/code.png)

请使用android高版本（>5.0）最新版chrome浏览器访问。

## 目录
- 任务清单，[查看所有可配置项](https://developer.mozilla.org/en-US/docs/Web/Manifest "配置项")
- 离线浏览
- 推送通知
- 工具：[性能工具LightHouse](https://developers.google.com/web/tools/lighthouse "LightHouse")，[sw工具库sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox "sw-toolbox")

## 开始
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## 项目结构
由于本项目使用vue-cli生成结构，大部分目录同vue项目，重点看/src/sw、index.html。

> **注意：** 如需开启推送功能，开发时将 sw/ 目录下各文件域名替换为自己的域名
- index.html
- /src/sw
    - manifest.json
    - register.dev.js
    - register.prd.js
    - register.simple.js
    - service-worker.tmpl
    - sw.js

## 运行过程
pwa工作依赖于Service Worker（简称sw）。
> 任务清单 -> sw注册 -> sw监听/代理

1. 首先在index.html引入manifest.json和用于注册sw的register.js；
2. 接着register.js会检测navigator.serviceWorker并将sw.js注册；
3. 最后sw.js持续监听和代理sw事件。

> 注意：本项目使用copy-webpack-plugin和sw-precache-webpack-plugin将/src/sw下的文件编译并生成到项目根目录下，因此使用<%= htmlWebpackPlugin.files.publicPath %>变量获取

**index.html:**
```html
<!DOCTYPE html>
<html>
  <head>
    ...
    <!-- Manifest -->
    <link rel="manifest" href="<%= htmlWebpackPlugin.files.publicPath %>manifest.json">
  </head>
  <body>
    ...
    <!-- Service Worker register -->
    <!-- without webpush -->
    <script src="<%= htmlWebpackPlugin.files.publicPath %>register.simple.js"></script>
    <!-- with webpush -->
    <!-- <script src="<%= htmlWebpackPlugin.files.publicPath %>register.js"></script> -->
  </body>
</html>
```
**register.js:**
```js
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js')
    .then(function (registration) {
      console.log('Registered events at scope: ', registration)
    })
    .catch(function (err) {
      console.log('ServiceWorker registration failed: ', err)
    })
}
```
**sw.js:**
```js
self.addEventListener('some event', e => {
  // do something
})
```

## 工作规则
### 添加到主屏幕
添加到主屏幕既可安装，需要满足以下条件：
1. 需要 manifest.json 文件
2. 清单文件需要启动 URL(start_url)
3. 清单文件至少需要 144x144 的 PNG 图标
4. 网站正在使用通过 HTTPS（或localhost） 运行的 Service Worker，既sw处于activated状态
5. 用户需要至少浏览网站两次，并且两次访问间隔在五分钟之上

![添加到主屏幕](https://user-gold-cdn.xitu.io/2018/3/12/16218297564a044a?w=586&h=253&f=png&s=76682)

```json
{
  "name": "PWA Lite",
  "short_name": "PWA",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "./static/appicon_144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "./static/appicon_96.png",
      "sizes": "96x96",
      "type": "image/png"
    },

    {
      "src": "./static/appicon_48.png",
      "sizes": "48x48",
      "type": "image/png"
    }
  ]
}
```

在chrome开发者工具中：
1. Application/Manifest 检查manifest.json有效性
2. Application/Service Workers 查看当前sw状态
3. Application/Service Workers 调试时可勾选"Update on reload"

添加到主屏幕只会显示一次，这在调试过程非常不便。不过，如果你使用chrome调试，可以访问 **chrome://flags/#bypass-app-banner-engagement-checks** 勾选忽略，这样每次访问都会显示。

### 离线浏览
sw提供很多种 [缓存模式](https://jakearchibald.com/2014/offline-cookbook/ "缓存模式")。

sw处于activated状态时，可以在sw.js监听fetch事件并拦截和处理任何请求：
```js
// 请求命中缓存时直接返回缓存结果，否则发起请求
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response != null) {
        return response
      }
      return fetch(e.request.url)
    })
  )
})
```

![离线浏览](https://user-gold-cdn.xitu.io/2018/3/12/162182ab8a3cddb2?w=592&h=251&f=png&s=56299)

在chrome开发者工具中：
1. Application/Cache/Cache Storage 查看缓存列表
2. 如果sw拦截成功，在Network中size列可以看到(from ServiceWorker)字样
3. 在Network中勾选offline然后刷新页面，可以看到已访问过的页面仍然可以访问，并不会出现“未连接到互联网”，这就是离线浏览的威力

### 关于浏览器缓存模式
1. **from memory cache**  内存，只存在浏览器运行时，如base64图片数据和静态资源，不可控
2. **from disk cache**    硬盘，长期缓存在硬盘中，如静态资源，不可控
3. **from ServiceWorker** sw代理，完全可控

![浏览器缓存模式](https://user-gold-cdn.xitu.io/2018/3/12/162182b497b534ca?w=752&h=144&f=png&s=46193)

### 消息推送
![notification](https://raw.githubusercontent.com/SangKa/PWA-Book-CN/master/assets/figure6.4.png "notification")

消息推送需要满足以下条件：
1. sw处于activated状态
2. 用户允许通知
3. 询问用户是否允许的对话框只会显示一次，可以在chrome地址栏点击i图标，将“通知”项改为“使用全局默认设置（询问）”即可发起询问对话框
4. 用户允许后会得到订阅对象，其中endpoint指向谷歌的推送服务器，因此接收时需要全局翻墙

![消息推送](https://user-gold-cdn.xitu.io/2018/3/12/162182bca562924b?w=513&h=263&f=png&s=51909)

```js
// 服务器推送事件
self.addEventListener('push', e => {
  // do something
}

// 推送消息对话框点击事件
self.addEventListener('notificationclick', e => {
  // do something
}
```