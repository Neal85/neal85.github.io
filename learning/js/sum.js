/*
    在数组中找到两个数，使得它们的和等于一个给定的数, 不能使用同一个元素两次
*/

function twoSum(nums, target) {
    if (nums.length < 2) return [];

    let results = [];

    let used = new Set();
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (!used.has(i) && !used.has(j) && nums[i] + nums[j] == target) {
                results.push([i, j]);
                used.add(i).add(j);
                break;
            }
        }
    }

    return results;
}


let nums = [2, 7, 11, 1, 8, 7, 2, 8];
let target = 9;
console.log(twoSum(nums, target)); // [[0, 1], [3, 4], [6, 7]]