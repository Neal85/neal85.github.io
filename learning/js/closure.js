
//把for循环中的var改成let, let存在块级作用域，每一次循环都会在当前块作用域中形成一个私有变量i存储0~5，当定时器执行的时候，所使用的i就是所处块作用域中的i
for (var i = 0; i < 5; i++) {
    setTimeout(() => {
        console.log(i)
    }, 1000)
}


for (var i = 0; i < 5; i++) {
    ~function (n) {
        setTimeout(() => {
            console.log('n:', n)
        }, 1000)
    }(i)
}


for (var i = 0; i < 5; i++) {
    setTimeout(
        ((n) => {
            return () => {
                console.log(n);
            };
        })(i),
        1000
    );
}

for (var i = 0; i < 5; i++) {
    setTimeout((n => () => console.log(n))(i), 1000)
}


//可以基于bind的预先处理机制：在循环的时候就把每次执行函数需要输出的结果，预先传给函数即可
let fn = function (i) {
    console.log(i);
};
for (var i = 0; i < 5; i++) {
    setTimeout(fn.bind(null, i), 1000);
}


function fun(n, o) {
    console.log("n:", n, "o:", o);

    return {
        fun: function (m) {
            return fun(m, n);
        },
    };
}
var c = fun(0).fun(1);
c.fun(2);
c.fun(3);