/*
    手写Promise.all
*/


function myPromiseAll(promises) {

    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) {
            return reject(new TypeError('arguments must be an array'));
        }

        let len = promises.length;
        
        let completed = 0;
        let results = [];

        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then((res) => {
                    results[index] = res;
                    completed++;

                    if (completed >= len) {
                        resolve(results);
                    }
                })
                .catch((err) => reject(err));
        });
    });
}


// test
let p1 = Promise.resolve(1);
let p2 = Promise.resolve(2);

myPromiseAll([p1, p2]).then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});