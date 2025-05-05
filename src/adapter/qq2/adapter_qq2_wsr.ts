/**
 * @Time: 2025/5/3 23:18
 * @Author: 魂焱
 * @File: adapter_qq2_wsr.ts
 * @Software: WebStorm
 * @Description: 此适配器是纯翻译autMan的示例适配器 adapter_q2_wsr.py 未测试可用性
 */
//[title: adapter_qq2_wsr]
//[author: hunyan]
//[language: nodejs]
//[class: 工具类]
//[service: 2946148573] 售后联系方式
//[disable:false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[priority: 100] 优先级，数字越大表示优先级越高
//[platform: qq,qb,wx,tb,tg,web,wxmp] 适用的平台
//[open_source: false]是否开源
//[icon: ]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 0.0.1]版本号
//[public:false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: 示例插件]

import middleware from "middleware";
import {QQ2WsrAdapter} from "../../modules_adapter/qq2/QQ2WsrAdapter";
const adapterType = "__AUT_ADAPTER_TYPE__";

(async ()=>{
	const autPort = await middleware.port();
	const adapter = new QQ2WsrAdapter(Number(autPort), adapterType,"ws://");
	adapter.run().catch((e)=>{
		console.log(e);
	})
})()