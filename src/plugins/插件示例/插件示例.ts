/**
 * @Time: 2025/3/28 18:35
 * @Author: 魂焱
 * @File: 插件示例.ts
 * @Software: WebStorm
 * @Description:
 */
// [title: 插件示例]
// [author: hunyan]
//[language: nodejs]
//[class: 工具类]
//[service: 2946148573] 售后联系方式
//[disable:false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: ^node_dev插件示例$] 匹配规则，多个规则时向下依次写多个
//[cron: 0 0 0 0 0] cron定时，支持5位域和6位域
//[priority: 100] 优先级，数字越大表示优先级越高
//[platform: qq,qb,wx,tb,tg,web,wxmp] 适用的平台
//[open_source: false]是否开源
//[icon: ]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 0.0.1]版本号
//[public:false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: 示例插件]

import {getSenderID,Sender,} from 'middleware';
import {Example,example2} from "../../modules_plugin/插件示例/插件示例";

const senderID = getSenderID();
const sender = new Sender(senderID);
(async ()=>{
	// 方式1 使用class
	const example = new Example(sender);
	await example.run();
	// 方式2 使用函数
	// await example2(sender);
})().catch(async e=>{
	console.log(e);
	await sender.reply("发生错误，请查看日志");
})
