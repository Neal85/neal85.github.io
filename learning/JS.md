# Javascript


## 模块
1. CommonJS（主要用于 Node.js 环境）
   module.exports = {};
   const m = require('ModuleName')

2. AMD（Asynchronous Module Definition，主要用于浏览器环境）
   define(['dependency'], fn);
   require(['myModule'], function(myModule) {});

3. UMD（Universal Module Definition，兼容 CommonJS 和 AMD）
   
4. ES6 模块（现代 JavaScript 标准）
   export fn name;
   import { fn } from './myModule';



### Common
1. WeakMap不会阻止垃圾回收。如果一个对象变得“不可访问”（例如，没有变量再引用它），则 WeakMap 允许将其从内存中清除，因为我们不再需要它了。

1. 判断数组的方法
   
        1.Arrar.isArray()
        2.Object.prototype.toString.call(Array) === [object array]
        3.[].constrtucor == Array
        4.[] instanceof Array 
        5.[].__proto__ === Array.prototype

1. 为什么 0.1 + 0.2 !== 0.3？
    精度丢失的问题，0.1 + 0.2 由于两次存储时的精度丢失加上一次运算时的精度丢失，所以最终结果 0.1 + 0.2 !== 0.3。 可以利用 ES6 中的极小数 Number.EPSILON 来进行判断。

1. new操作符的实现步骤如下：
    （1）首先创建了一个新的空对象
    （2）设置原型，将对象的原型设置为函数的 prototype 对象。
    （3）让函数的 this 指向这个对象，执行构造函数的代码（为这个新对象添加属性）
    （4）判断函数的返回值类型，如果是值类型，返回创建的对象。如果是引用类型，就返回这个引用类型的对象。

1. typeof 与 instanceof 区别
    typeof 会返回基本数据类型 instanceof是返回的布尔值
    他们两个最大的区别还是 typeof 对用引用类型的只会返回 object  包括null ，只会检测到 function 
    instanceof 可以准确判断复杂的引用数据类型，但不能判断基本数据类型
    如果需要通用的检测数据类型，可以使用 Object.prototype.tostring.call

1. 尾递归是什么，有什么作用
    首先我们要知道递归是什么，无非就是在 函数里面在调用本身，而尾递归呢无非就是在尾部return调用，这样有什么好处呢，在递归中我们会反反复复的调用函数，触发递归的条件为false才会结束，这样造成的后果
    就是说 我的执行栈函数一直不会出去，必须等到最后一个递归函数执行完毕，函数才会开始离开执行栈，递归次数过多容易造成栈溢出，使用尾递归为什么不会这样的，当调用一个函数，在使用尾递归就会返回
    一个全新的函数去执行，也就不需要存储上一个函数了

1. 原型链的作用
    1.继承 
    2.实例对象能共享构造函数原型里面的方法 
    3 减少了方法的重复 每个实例只需使用构造函数的就可以了 
    4.减少了内存
