/*
https://juejin.cn/post/6844904147884441608

*/

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';



class MyPromise {

    constructor(excutor) {
        this.status = PENDING;
        
        this.value = undefined;
        this.reason = undefined;

        this.resolvedQueue = [];
        this.rejectedQueue = [];


        let resolve = (value) => {
            if (this.status !== PENDING) return;

            this.status = FULFILLED;
            this.value = value;
            this.resolvedQueue.forEach(cb => cb(this.value));
        };

        let reject = (value) => {
            if (this.status !== PENDING) return;

            this.status = REJECTED;
            this.reason = value;
            this.rejectedQueue.forEach(cb => cb(this.reason));
        };


        try {
            excutor(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }

    
    static resolvePromise(p, x, resolve, reject) {
        if (x instanceof MyPromise) {

            if (x.status === PENDING) {                
                x.then((v) => {
                    MyPromise.resolvePromise(p, v, resolve, reject);
                }, 
                (err) => reject(err));

            } else {
                x.then(resolve, reject);
            }

        } else {
            resolve(x);
        }
    }


    then(onFulfilled, onRejected) {

        onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : (value) => value;
        onRejected = typeof onRejected == 'function' ? onRejected : (value) => value;


        let result = new MyPromise((resolve, reject) => {
            
            if (this.status === PENDING) {
                this.resolvedQueue.push((v) => {
                    let x = onFulfilled(v);
                    MyPromise.resolvePromise(result, x, resolve, reject);
                });
                this.rejectedQueue.push((v) => {
                    let x = onRejected(v);
                    MyPromise.resolvePromise(result, x, resolve, reject);
                });
            } 
            else if (this.status === FULFILLED) {
                let x = onFulfilled(this.value);
                MyPromise.resolvePromise(result, x, resolve, reject);
            } 
            else if (this.status === REJECTED) {
                let x = onRejected(this.value);
                MyPromise.resolvePromise(result, x, resolve, reject);
            }
        });

        return result;
    }


    catch(onRejected) {
        return this.then(null, onRejected);
    }


    finally(fn) {
        return this.then(fn, fn);
    }


    static resolve(v) {
        return new MyPromise((resolve, reject) => {
            resolve(v);
        });
    }


    static all(arr) {
        return new MyPromise((resolve, reject) => {
            let results = [];
            let count = 0;
            
            for (let i = 0; i < arr.length; i++) {
                arr[i].then((v) => {
                    results[i] = v;
                    
                    if (++count == arr.length) {
                        resolve(results);
                    }

                }, (err) => {
                    reject(err);
                });
            }
        });
    }

}



// test
let p = new MyPromise((resolve, reject) => {
    console.log("Start");
    
    //resolve(1);
    //reject(2);

    setTimeout(() => {
        resolve("Timeout 3");
    }, 1000);
});

console.log('p:', p);


p.then((v) => {
    console.log("Result 1:", v);
    return "Then 1";

}).then(v => {
    console.log("Result 2:", v);
    
    return new MyPromise((resolved, rejected) => {
      setTimeout(() => {
        resolved("new promise timout 4");
      }, 1000);
    });

}).then(v => {
    console.log("Result 3:", v);
});


let p1 = new MyPromise(() => {
    setTimeout(() => {
        console.log("all p1");
    }, 1000);
});

let p2 = new MyPromise(() => {
    setTimeout(() => {
        console.log("all p2");
    }, 1000);
});


MyPromise.all([p1, p2]).then((results) => console.log("all:", results));



console.log("End");
