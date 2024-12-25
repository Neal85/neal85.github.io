# React


## React Scheduler - 时间切片
React Fiber架构下Scheduler的时间切片特性用于任务调度，避免长时间占用主线程导致页面卡住。对比了requestIdleCallback、requestAnimationFrame及requestHostCallback三种方案