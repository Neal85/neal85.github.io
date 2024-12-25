

function throttled(fn, delay = 300) {
    let prev = 0;

    return function (...args) {
        if (Date.now() - prev >= delay) {
            fn.apply(this, args);
            prev = Date.now();
    };
}


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