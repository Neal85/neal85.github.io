# React


## React Scheduler - 时间切片
React Fiber架构下Scheduler的时间切片特性用于任务调度，避免长时间占用主线程导致页面卡住。对比了requestIdleCallback、requestAnimationFrame及requestHostCallback三种方案


## 性能优化手段
1. shouldComponentUpdate
1. PureComponent
1. memo, useMemo, useCallback
1. 使用Fragment
1. v-for使用正确的key
1. 拆分尽可能小的可复用组件，ErrorBoundary
1. 使用React.lazy和React.Suspense延迟加载不需要立马使用的组件
1. 减少长任务的数量
1. 节流，防抖
1. SSR