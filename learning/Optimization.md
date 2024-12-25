# 优化
https://juejin.cn/post/7429128606749949978?searchId=2024122510384984D669735A77E965A47B

1. 前端性能
   1. 加载时间
      window.performance.timing 变量对象中记录了加载页面期间的各种计时信息
   2. 性能指标
      分析以用户为中心的性能指标，包含 FP（首次像素绘制）、FCP（首次内容绘制）、FMP（首次有意义绘制）、LCP（页面中最大的元素加载时间）等。JS 可以通过 PerformanceObserver 观察 event type paint 来获取 FCP 指标。如下示例，初始放置一个空 div，在 1s 以后给 div 中添加有效内容（模拟框架渲染），FCP 指标会在这时生成。
   3. 页面卡顿
   4. 分析 Performance 选项卡
   
2. 代码逻辑
   1. 复杂度分析
   2. 防抖节流
   3. 图片懒加载
   4. 时间切片
   5. Web Worker子进程
   6. LRU
   7. Tree shaking：针对没有使用的导出函数
   
3. 框架性能优化，React
   1. 对列表渲染加 key
   2. useMemo & useCallback
   3. PureComponent
   4. 批量更新
   5. 将「变化的部分」与「不变的部分」分离

4. 资源加载优化
   1. 压缩静态资源
   2. 合理使用缓存
   3. 使用 prefetch, preload 控制加载时机
   4. 使用 CDN
   5. 开启 Gzip
   6. 开启 HTTP2 多路复用, HTTP3 UDP

5. 交互体验 -- 使用骨架屏和Loading动画
6. 优化白屏
   1. SSR
   2. 优化资源大小
   3. 按需加载
   4. 懒加载

7. 打包策略
   1. 按需加载
   2. 合理分包
   3. external 外部模块
   4. 提取公共库 -- DLL
   5. 优化构建速度


## Vue & React 优化
1. 提取公共库 -- DLL
1. 拆分 Chunk, Bundle
1. Tree shaking：针对没有使用的导出函数
1. 路由懒加载
1. 异步加载 script 文件, async or defer
1. 拆解代码，基于前端火焰图减少 js 代码的解析时间



## prefetch
1. dns-prefetch
   尝试在请求资源之前解析域名
2. prefetch 
   是利用浏览器的空闲时间，加载页面将来可能用到的资源的一种机制；通常可以用于加载其他页面（非首页）所需要的资源. link rel="prefetch" href="test.js"
3. preload
   preload 加载的资源是在浏览器渲染机制之前进行处理的，并且不会阻塞 onload 事件; 加载的 JS 脚本其加载和执行的过程是分离的，即 preload 会预加载相应的脚本代码，待到需要时自行调用；



## 图片优化
1. 压缩图片
2. 使用 webp 或 avif
3. loading = lazy
4. 响应式图片, 使用 srcset and sizes 来提供额外的资源图像和提示，帮助浏览器选择最合适的资源



## 强制缓存和协商缓存
强制缓存有基于Expires和Cache-control两种，协商缓存有基于last-modified和ETag两种。有哈希值的文件设置强缓存即可。没有哈希值的文件（比如index.html）设置协商缓存

1. Expires已经被废弃了, Expires字段的作用是，设定一个强缓存时间. 因为Expires判断强缓存是否过期的机制是:获取本地时间戳，并对先前拿到的资源文件中的Expires字段的时间做比较。来判断是否需要对服务器发起请求
2. Cache-control:max-age=N,s-maxage=200000,public，N就是需要缓存的秒数。从第一次请求资源的时候开始，往后N秒内。max-age后面的值是一个滑动时间，从服务器第一次返回该资源时开始倒计时

    1. max-age决定客户端资源被缓存多久。
    2. s-maxage决定代理服务器缓存的时长。
    3. no-cache表示是强制进行协商缓存。
    4. no-store是表示禁止任何缓存策略。
    5. public表示资源即可以被浏览器缓存也可以被代理服务器缓存。
    6. private表示资源只能被浏览器缓存。

3. 基于last-modified的协商缓存实现方式是:首先需要在服务器端读出文件修改时间，将读出来的修改时间赋给响应头的last-modified字段。最后设置Cache-control:no-cache, 那么之后每次对该资源的请求，都会带上If-Modified-Since这个字段，而务端就需要拿到这个时间并再次读取该资源的修改时间
4. ETag就是将原先协商缓存的比较时间戳的形式修改成了比较文件指纹。
   第二次请求的时候，客户端自动从缓存中读取出上一次服务端返回的ETag也就是文件指纹。并赋给请求头的if-None-Match字段，让上一次的文件指纹跟随请求一起回到服务端。