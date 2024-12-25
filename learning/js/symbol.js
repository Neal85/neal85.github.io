/*
一旦创建，一定是唯一的

Symbol.for() 用来创建全局唯一的Symbol

Symbol作为对象属性名的时候需要[]表示，通过Symbol创建的属性是不必希望被外界访问的属性
Symbol属性不会出现在for...in、for...of循环中，也不会被Object.keys()、Object.getOwnPropertyNames()、JSON.stringify()返回
*/

let a = Symbol('aa');
let b = Symbol('bb');
console.log(a === b); // false



let age = Symbol('age');
let obj = {
    name: 'Tom',
    [age]: 18
};

console.log(obj); // {name: "Tom", Symbol(age): 18}
console.log(obj[age]); // 18
console.log(obj.age); // undefined
console.log(Object.keys(obj)); // ["name"]
