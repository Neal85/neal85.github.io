
// 输出顺序
console.log(1);

setTimeout(() => {
  console.log(2);
}, 0);

let a = new Promise((resolve) => {
  console.log(3);
  resolve();
})
  .then(() => {
    console.log(4);
  })
  .then(() => {
    console.log(5);
  });

console.log(6);
