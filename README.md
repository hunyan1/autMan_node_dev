# autMan_node_dev

一个用于autMan使用ts开发nodejs插件和适配器的方案

## 介绍

[autMan](https://bbs.autman.cn)是个扩展性极强的工具
这是一款功能强大的自动化软件系统，它支持多语言插件、多脚本运行、返利功能、与即时通讯平台的对接，以及自定义微服务路由。这使其适用于各种自动化任务和定制功能的开发。

本项目是通过webpack对ts打包，生成适用于autMan的nodejs插件和适配器的方案。

## 目录结构
```
|-- autMan_node_dev
    |-- plugins
    |   |-- MoveCommentsToTop.js (webpack插件,用于将注释移动到顶端)
    |-- src
    |   |-- adapter  (autMan适配器入口)
    |   |-- common
    |   |-- modules_adapter  (autMan适配器)
    |   |-- modules_plugin  (autMan插件)
    |   |-- plugins  (autMan插件入口)
    |   |-- types  (类型声明文件)
    |   |   |-- middleware.d.ts (autMan中间件类型声明文件)
    |-- package.json
    |-- README.md
    |-- tsconfig.json (ts配置)
    |-- webpack.config.js (webpack配置)
```
## 建议
 在``src/adapter``和``src/plugins``文件夹下只放适配器和插件的入口文件，其他文件建议到``modules_adapter``和``modules_plugin``文件夹下进行编写，打包会将``src/adapter``和``src/plugins``文件夹下的ts文件作为入口进行打包，最后生成在dist文件夹下！

## 使用

```shell
    git clone https://github.com/hunyan1/autMan_node_dev.git
    cd autMan_node_dev
    npm install
```