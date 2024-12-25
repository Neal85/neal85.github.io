/*
    typeof, instanceof, constructor
    typeof: 可以用来判断: string, number, boolean, undefined, function, object, symbol, bigint
    instanceof: 用来判断一个实例是否属于某种类型, 但是不能判断基本数据类型. 例如: a instanceof Array, a instanceof Object, a instanceof Function
    constructor: 用来判断一个实例的构造函数是什么, 但是可以被修改, 所以不是很可靠. 例如: a.constructor === Array, a.constructor === Object, a.constructor === Function
*/