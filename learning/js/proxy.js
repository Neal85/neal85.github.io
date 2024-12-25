/*
    Proxy, Reflect, Object.defineProperty
    Proxy: 代理对象，用于定义基本操作的自定义行为
    https://zh.javascript.info/proxy
    Proxy 无法拦截严格相等性检查 ===

    Reflect: 用于执行对象默认操作的方法
    Object.defineProperty: 定义对象属性

    Proxy
    读取（get），写入（set），删除（deleteProperty）属性（甚至是不存在的属性）。
    函数调用（apply 捕捉器）。
    new 操作（construct 捕捉器）。
    许多其他操作（完整列表请见本文开头部分和 docs）。
    这使我们能够创建“虚拟”属性和方法，实现默认值，可观察对象，函数装饰器等。

    我们还可以将对象多次包装在不同的代理中，并用多个各个方面的功能对其进行装饰。

    Reflect API 旨在补充 Proxy。对于任意 Proxy 捕捉器，都有一个带有相同参数的 Reflect 调用。我们应该使用它们将调用转发给目标对象。

    Proxy 有一些局限性：
    内建对象具有“内部插槽”，对这些对象的访问无法被代理。如 Map，Set，Date 等。这些对象的
    私有类字段也是如此，因为它们也是在内部使用插槽实现的。因此，代理方法的调用必须具有目标对象作为 this 才能访问它们。
    对象的严格相等性检查 === 无法被拦截。
    性能：基准测试（benchmark）取决于引擎，但通常使用最简单的代理访问属性所需的时间也要长几倍。实际上，这仅对某些“瓶颈”对象来说才重要。
*/

// 1. Proxy
let target1 = {};
let proxy1 = new Proxy(target1, {});
proxy1.a = 1;

console.log(`target1: ${target1.a}, proxy1: ${proxy1.a}`); // 1

for (key in proxy1 ) console.log("proxy1 key:", key); // a



// 3. hide properties
let user = {
    name: "John",
    age: 30,
    _password: "***"
};
  
user = new Proxy(user, {
    ownKeys(target) {
        return Object.keys(target).filter(key => !key.startsWith('_'));
    }
});
  
// "ownKeys" 过滤掉了 _password
for(let key in user) console.log(key); // name，然后是 age

// 对这些方法的效果相同：
console.log( Object.keys(user) ); // name,age



let emptyUser = {};
emptyUser = new Proxy(emptyUser, {
  ownKeys(target) {
    // 一旦要获取属性列表就会被调用
    return ["a", "b", "c"];
  },

  getOwnPropertyDescriptor(target, prop) {
    // 被每个属性调用
    return {
      enumerable: true,
      configurable: true,
      /* ...其他标志，可能是 "value:..." */
    };
  },
});

console.log("User keys:", Object.keys(emptyUser) ); // a, b, c




// Reflect
let proxy2 = new Proxy({}, {
    get: function(target, key, receiver) {
        console.log(`getting ${key}`);
        return Reflect.get(target, key, receiver);
    },
    set: function(target, key, value, receiver) {
        console.log(`setting ${key}`);
        return Reflect.set(target, key, value, receiver);
    }
});
console.log("Reflect proxy2:", proxy2.a); // getting a, undefined
proxy2.a = 1; // setting a
console.log("Reflect proxy2:", proxy2.a); // getting a, 1



// Makeobservable

let handlers = Symbol('handlers');

function makeObservable(target) {

    target[handlers] = [];
    
    target.observe = function(handler) {
        this[handlers].push(handler);
    };

    return new Proxy(target, {
        set(target, property, value, receiver) {
            let success = Reflect.set(...arguments);
            if (success) {
                target[handlers].forEach(handler => handler(property, value));
            }
            return success;
        }
    })
}

let user2 = {};
user2 = makeObservable(user2);
user2.observe((key, value) => {
    console.log(`Observe SET ${key}=${value}`);
});

user2.name = "John"; // SET name=John