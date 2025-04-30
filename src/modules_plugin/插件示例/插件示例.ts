/**
 * @Time: 2025/3/28 18:35
 * @Author: 魂焱
 * @File: 插件示例.ts
 * @Software: WebStorm
 * @Description:
 */
import {Sender} from "middleware";
import {PluginCommon} from "../../common/PluginCommon";

export class Example extends PluginCommon {
	async run(){
		await this.sender.reply("插件示例运行,请在30秒内输入内容")
		const input = await this.sender.input(30000,2000)
		await this.sender.reply(input)
	}
}

export async function example2(sender:Sender) {
	await sender.reply("插件示例运行,请在30秒内输入内容")
	const input = await sender.input(30000,2000)
	await sender.reply(input)
}
