
// 节流
function throttled(fn, delay = 300) {
    let prev = 0;
    return function (...args) {
        let now = Date.now();
        if (now - prev >= delay) {
            fn.apply(this, args);
            prev = now;
    };
}


// 防抖
function debounce(func, wait) {
    let timeout;

    return function () {
        let context = this; // 保存this指向
        let args = arguments; // 拿到event对象

        clearTimeout(timeout)
        timeout = setTimeout(function(){
            func.apply(context, args)
        }, wait);
    }
}