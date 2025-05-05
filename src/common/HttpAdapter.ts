/**
 * @Time: 2025/4/11 13:43
 * @Author: 魂焱
 * @File: HttpAdapter.ts
 * @Software: WebStorm
 * @Description:
 */
import {AutProto} from "../types/common";
import {WebSocket,RawData} from "ws"

export abstract class HttpAdapter {
	private readonly autAddr: string;
	private autWs: WebSocket;
	protected readonly adapterName: string;
	/*
	* HTTP适配器
	* @param autPort:number autMan端口
	* @param adapterType:string 适配器的im名称
	* @param autProto:AutProto autMan的协议(一般有SSL填写wss://,没有SSL填写ws://)
	* */
	constructor(autPort:number, adapterType:string, autProto:AutProto="ws://") {
		this.adapterName = adapterType
		this.autAddr = `${autProto}127.0.0.1:${autPort}/${adapterType}/adapter`
		this.autWs = new WebSocket(this.autAddr)
	}

	// 初始化方法，用于适配器作者检查一些参数或者状态，返回true继续执行，其它返回直接结束适配器！
	protected abstract init():boolean|Promise<boolean>;

	protected adapterOpen(){
		console.log(`${this.adapterName} 适配器已连接autMan`)
	}

	protected adapterClose(code: number, reason: Buffer){
		console.log(`${this.adapterName} 适配器已从autMan断开`)
	}

	getTimeRFC3339() {
		const date = new Date()
		let y = date.getFullYear()
		let m = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
		let d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
		let hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
		let mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
		let ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
		let endDate = y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
		endDate = endDate.replace(/\s+/g, 'T') + '+08:00'
		return endDate
	}

	protected adapterMessage(data: RawData, isBinary: boolean){
		if (isBinary){
			console.log('二进制消息,直接丢给Im处理')
			this.ImHandle(data,this.sendAutMan.bind(this))
			return
		}
		console.log(`${this.adapterName} 适配器收到消息`,data.toString())
		try {
			const msg = JSON.parse(data.toString())
			if ('aut_action' in msg&& 'aut_echo' in msg){
				console.log("来自autMan内部的消息，交给aut处理")
				this.autHandle(msg,this.sendAutMan.bind(this))
			}else {
				this.ImHandle(msg,this.sendAutMan.bind(this))
			}
		}catch (e) {
			console.log(e)
			this.ImHandle(data,this.sendAutMan.bind(this))
		}
	};

	protected adapterError(error: Error){
		console.log(`${this.adapterName} 适配器连接autMan出现错误`,error)
	}

	/*
	* 用于处理来自Im的消息
	* */
	protected abstract ImHandle(data:any,sendAut:typeof this.sendAutMan):void|Promise<void>;

	/*
	* 用于处理来自autMan内部的消息
	* */
	protected abstract autHandle(data:any,sendAut:typeof this.sendAutMan):void|Promise<void>;

	/*
	*  由于autMan内部处理的消息是json，所以直接传入对象即可
	*  此方法用于向autMan内部发送消息，即作者将Im的消息处理成autMan所需的格式，调用此方法即可让autMan处理此消息
	* */
	protected sendAutMan(data:object){
		this.autWs.send(JSON.stringify(data))
	}

	async run(){
		const init = await this.init();
		if(!init){
			return
		}
		this.autWs.on("open",this.adapterOpen.bind(this))
		this.autWs.on("close",this.adapterClose.bind(this))
		this.autWs.on("message",this.adapterMessage.bind(this))
		this.autWs.on("error",this.adapterError.bind(this))
	}
}