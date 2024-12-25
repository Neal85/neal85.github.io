/**
* 题目：实现一个type类型，用于约束特殊时间格式的字符串
* 例子：
* FormatDate<"DD-MM-YY">
* 
* 允许的字符串为：
* const date: FormatDate<"DD-MM-YY"> = "12-12-2024" | "12-02-2024" :
* 
* 不允许的字符串为：
* const date: FormatDate< "DD-MM-YY"> = "112-12-2024" | "12-112-2024" | "12-12-12024" | ...
* 时间格式支持多种分隔符：“-"|“."|“/"
*/

type Seperator = "-" | "." | "/";
type Num = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Num2 = 0 | Num;

type YY = `19${Num2}${Num2}` | `20${Num2}${Num2}`;
type MM = `0${Num}` | "10" | "11" | "12";
type DD = `0${Num}` | `${1 | 2}${Num2}` | "30" | "31";

type GenStr<Type extends string> = Type extends 'YY' ? YY : Type extends 'MM' ? MM : DD;

type FormatDate<Pattern extends string> = 
    Pattern extends `${infer Aaa}${Seperator}${infer Bbb}${Seperator}${infer Ccc}` 
    ? Pattern extends `${Aaa}${infer Seq}${Bbb}${infer Seq}${Ccc}`
        ? `${GenStr<Aaa>}${Seq}${GenStr<Bbb>}${Seq}${GenStr<Ccc>}`
        : never
    : never;


// 测试用例
const a: FormatDate<'YY-MM-DD'> = '2023-01-02';
const b: FormatDate<'YY.MM.DD'> = '2023.01.02';
const c: FormatDate<'YY/DD/MM'> = '2023/02/01';

console.log(a, b, c);