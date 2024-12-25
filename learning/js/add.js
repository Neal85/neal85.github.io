/*
    add(1,2,3)(4) = 10
    add(1)(2)(3)(4) = 10
*/

function add(...args) {
    let sum = args.reduce((a, b) => a + b, 0);
    
    function adder() {
        sum += Array.from(arguments).reduce((a, b) => a + b, 0);
        return adder;
    }
    adder.toString = function() {
        return sum;
    }

    return adder;
}


console.log(add(1,2,3)(4) == 10); // 10
console.log(`Value: ${add(1)(2)(3)(4)}`); // 10
