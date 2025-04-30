/**
 * @Time: 2025/3/28 21:15
 * @Author: 魂焱
 * @File: adapter_ggb1_http.ts
 * @Software: WebStorm
 * @Description:
 */
// [title: adapter_ggb1_http]
// [author: hunyan]
//[language: nodejs]
//[class: 工具类]
//[service: 2946148573] 售后联系方式
//[disable:false] 禁用开关，true表示禁用，false表示可用
//[admin: false] 是否为管理员指令
//[rule: ^$] 匹配规则，多个规则时向下依次写多个
//[cron: 0 0 0 0 0] cron定时，支持5位域和6位域
//[priority: 100] 优先级，数字越大表示优先级越高
//[platform: qq,qb,wx,tb,tg,web,wxmp] 适用的平台
//[open_source: false]是否开源
//[icon: ]图标链接地址，请使用48像素的正方形图标，支持http和https
//[version: 0.0.1]版本号
//[public:false] 是否发布？值为true或false，不设置则上传aut云时会自动设置为true，false时上传后不显示在市场中，但是搜索能搜索到，方便开发者测试
//[price: 999] 上架价格
//[description: ]
//[param: {"required":true,"key":"Y_adapter.ggb1.addr","bool":false,"placeholder":"","name":"GGB的地址","desc":"示例：http://127.0.0.1:9420"}]

import * as middleware from "middleware";
import * as console from "node:console";
import {GGB1HttpAdapter} from "../../modules_adapter/ggb/GGB1HttpAdapter";

// 固定写法，编译的时候会将__AUT_ADAPTER_TYPE__替换为头部注释中 title: adapter_ggb1_http 的ggb1
const adapterType = "__AUT_ADAPTER_TYPE__";

(async ()=>{
	const autPort = await middleware.port();
	const ggbAddr = await middleware.bucketGet("Y_adapter.ggb1", "addr");
	const adapter = new GGB1HttpAdapter(Number(autPort), adapterType,ggbAddr,"ws://");
	adapter.run().catch((e)=>{
		console.log(e);
	})
})()
