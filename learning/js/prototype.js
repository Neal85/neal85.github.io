/*
    Prototype 原型链
    1. 每个函数都有一个prototype属性，指向一个对象
    2. 每个对象都有一个__proto__属性，指向构造函数的prototype
    3. 当访问一个对象的属性或方法时，如果对象本身没有这个属性，就会去__proto__中查找，如果__proto__中也没有，就会去__proto__.__proto__中查找。以此类推，直到找到Object.prototype.__proto__为null。
*/