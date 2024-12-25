# Webpack And Vite
https://zhuanlan.zhihu.com/p/4050459008


## Webpack
操作流程主要分为以下几个阶段：
1. 初始化参数
2. 开始编译前的准备
   1. 创建 Compiler 实例
   2. 应用插件（Plugin）
   3. 设置入口（Entry）相关信息
   4. 初始化模块工厂（Module Factory）和解析规则（Rule）
   5. 创建编译环境（Compilation Environment）相关对象
3. 编译模块
   1. 模块工厂（Module Factory）的准备
   2. 解析规则（Rule）的进一步处理
   3. 解析器（Parser）的初始化与配置
4. 输出资源


### 概念
1. loader
   loader 用于对模块的源代码进行转换。loader 可以使你在 import 或 "load(加载)" 模块时预处理文件。因此，loader 类似于其他构建工具中“任务(task)”，并提供了处理前端构建步骤的得力方式。loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript 或将内联图像转换为 data URL。loader 甚至允许你直接在 JavaScript 模块中 import CSS 文件！

        npm install --save-dev css-loader ts-loader
        module.exports = {
            module: {
                rules: [
                { test: /\.css$/, use: 'css-loader' },
                { test: /\.ts$/, use: 'ts-loader' },
                ],
            },
        };

2. plugin
   webpack 插件是一个具有 apply 方法的 JavaScript 对象。apply 方法会被 webpack compiler 调用，并且在 整个 编译生命周期都可以访问 compiler 对象。

        const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

        class ConsoleLogOnBuildWebpackPlugin {
            apply(compiler) {
                compiler.hooks.run.tap(pluginName, (compilation) => {
                    console.log('webpack 构建正在启动！');
                });
            }
        }

        module.exports = ConsoleLogOnBuildWebpackPlugin;

3. compiler 钩子
   常用的钩子：
   compilation -- compilation 创建之后执行。
   afterCompile -- compilation 结束和封印之后执行。
   shouldEmit -- 在输出 asset 之前调用。返回一个布尔值，告知是否输出。

4. compilation 钩子
   Compilation 模块会被 Compiler 用来创建新的 compilation 对象（或新的 build 对象）
   additionalAssets -- 为 compilation 创建额外 asset。
   chunkAsset -- 一个 chunk 中的一个 asset 被添加到 compilation 时调用


### 生命周期



## Vite



## 功能方面
Webpack
功能极为强大且全面，堪称前端构建工具中的 “全能选手”。它不仅能够处理各种类型的前端资源，如 JavaScript、CSS、图片、字体等，还能深入管理模块依赖关系。通过丰富的配置选项和插件体系，可实现代码分割、懒加载、热更新等高级功能，有效优化项目性能。例如，在大型单页应用中，能够将代码按需分割成多个小块，实现页面的快速加载。
Rollup
专注于 JavaScript 模块的打包，对 ES6 模块的支持尤为出色，能够精准地进行静态分析，通过强大的树摇（Tree - Shaking）功能，去除未使用的代码，从而生成简洁、高效的代码包。特别适合用于开发 JavaScript 库，确保库的体积小巧且性能卓越。例如，在开发一个工具库时，Rollup 可以只打包实际使用的函数，减少不必要的代码引入。
Vite
结合了 ES 模块的优势和现代开发需求，在开发阶段利用浏览器对 ES 模块的原生支持，实现了超快速的冷启动和即时的热模块替换（HMR），极大地提高了开发效率。在生产环境下，也能进行有效的打包优化，如代码压缩、分割等，确保项目的性能。例如，在开发一个 Vue 项目时，Vite 可以快速启动开发服务器，实时更新模块，无需长时间等待打包过程。


## 适用场景
Webpack
适用于各种规模和类型的项目，尤其在大型复杂的单页应用（SPA）和具有复杂模块依赖关系的项目中表现卓越。其强大的功能和高度的可定制性，能够满足项目在不同阶段的各种需求，无论是开发过程中的热更新，还是生产环境下的性能优化。
Rollup
是开发 JavaScript 库的理想选择，专注于生成高质量、紧凑的代码包。当需要创建一个供其他项目引用的库时，Rollup 能够确保库的体积最小化，同时提供良好的性能和兼容性。
Vite
非常适合追求高效开发体验和快速迭代的现代前端项目，特别是基于 Vue、React 等新兴前端框架的应用开发。在开发过程中，快速的启动速度和实时更新能力能够显著提升开发效率，同时在生产环境下也能保证项目的性能。


## 配置复杂度
Webpack
配置相对复杂，需要深入理解众多的概念和选项，如入口（entry）、出口（output）、加载器（loader）、插件（plugin）、模块解析规则等。对于初学者来说，学习曲线较为陡峭，但一旦掌握，能够实现高度定制化的构建流程。例如，配置一个复杂的 Webpack 项目可能需要详细设置多个加载器来处理不同类型的文件，以及配置各种插件来实现特定的功能。
Rollup
配置相对简洁，主要关注入口点、输出格式和插件的配置。其配置文件通常较为直观，易于理解，对于专注于 JavaScript 打包且对配置复杂度要求较低的开发者来说，更容易上手。例如，在打包一个简单的 JavaScript 库时，Rollup 的配置可能只需要指定入口文件和输出格式即可。
Vite
在开发环境中，配置相对简单，主要关注项目的基本结构和依赖管理。在生产环境构建时，其配置与传统打包工具有一定相似性，但也结合了自身特点进行了优化，整体上在保持一定功能性的同时，尽量简化了配置过程，以提供高效的开发和构建体验。例如，在创建一个 Vite 项目时，只需简单配置项目入口和基本的构建选项即可快速开始开发。