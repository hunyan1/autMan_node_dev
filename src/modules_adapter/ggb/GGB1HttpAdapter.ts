import {HttpAdapter} from "../../common/HttpAdapter";
import {AutProto} from "../../types/common";
import axios, {AxiosInstance} from "axios";
import * as xml2js from 'xml2js';

// 继承HttpAdapter 只需要实现init、ImHandle、autHandle方法就可以开发自己需要的http适配器
export class GGB1HttpAdapter extends HttpAdapter {
	private readonly axios: AxiosInstance;
	private readonly ggbAddr: string;

	constructor(autPort:number,adapterType:string,ggb:string,autProto:AutProto="ws://") {
		super(autPort,adapterType,autProto);
		this.ggbAddr = ggb;
		this.axios = axios.create({
			baseURL:this.ggbAddr
		})
	}
	protected init(): boolean | Promise<boolean> {
		if (!this.ggbAddr){
			return false;
		}
		return true;
	}

	protected async ImHandle(data: any, sendAut: (data: object) => void): Promise<void> {
		const {nickname} = await this.ggbQueryNickname(data.memberwxid?data.memberwxid:data.wxid);
		const toAutMsg = {
			chat_id: data.memberwxid?data.wxid:"",
			bot_id: data.botwxid,
			user_id:data.memberwxid?data.memberwxid:data.wxid,
			user_name: nickname,
			im_type: this.adapterName,
			message_id: Date.now().toString(),
			content: data.content
		}
		const msgType = data.Msgtype;
		if (msgType === 49){
			const transferInfo = await this.parseXml(data.content) as any;
			console.log(JSON.stringify(transferInfo,null,2));
			const transferType = transferInfo.msg.appmsg[0].type[0];
			switch (transferType){
				case "2000":
					const transferId = transferInfo.msg.appmsg[0].wcpayinfo[0].transferid[0];
					const pay_memo = transferInfo.msg.appmsg[0].wcpayinfo[0].pay_memo[0];
					const feedesc = transferInfo.msg.appmsg[0].wcpayinfo[0].feedesc[0] as string;
					const amount = Number(feedesc.slice(1))
					const transferRes = await this.ggbTransfer(data.wxid,transferId,false);
					if (transferRes.state){
						const result = {
							"type": `GGB转账(${pay_memo})`,
							"FromWxid": data.wxid,
							"FromName": nickname,
							"money": amount,
							"time": this.getTimeRFC3339()
						}
						sendAut(result);
					}
					return
				case "5":
					const money = Number(transferInfo.msg.appmsg[0].mmreader[0].template_detail[0].line_content[0].topline[0].value[0].word[0].slice(1))
					const result = {
						"type": `GGB个人收款码或赞赏码收款`,
						"FromWxid": data.wxid,
						"FromName": nickname,
						"money": money,
						"time": this.getTimeRFC3339()
					}
					console.log(result)
					sendAut(result);
					return
				default:
					break;
			}

		}
		sendAut(toAutMsg)
	}

	protected async autHandle(data: any,sendAut: (data: object) => void): Promise<void> {
		const {aut_action,aut_echo,aut_params} = data
		const echoMsgIds:string[] = [];
		switch (aut_action) {
			case "reply_message":
				console.log("需要回复消息", aut_params.content)
				const towxid = aut_params.chat_id?aut_params.chat_id:aut_params.user_id;
				const userId = aut_params.user_id;
				const content = aut_params.content;
				const nickName = aut_params.user_name
				const resId = await this.replyMessage(content,towxid,nickName,userId,aut_params.chat_id)
				if (resId){
					echoMsgIds.push(...resId)
				}
				break;
			case "push_message":
				console.log("需要推送消息", aut_params.content)
				break;
			default:
				break;
		}
		sendAut({
			aut_echo,
			aut_params:echoMsgIds
		})
	}

	async replyMessage(content:string,towxid:string,nickName:string,userID:string="",isGroup:boolean=false){
		const result:string[] = [];
		const regexImage = /\[CQ:image,file=.*?\]/g;
		const regexVideo = /\[CQ:video,file=.*?\]/g;
		const regexFile = /\[CQ:file,file=.*?\]/g;
		const matchImg = content.match(regexImage);
		const matchVideo = content.match(regexVideo);
		const matchFile = content.match(regexFile);
		let text = content;
		const images:string[] = [];
		const videos:string[] = [];
		const files:string[] = [];
		if (matchImg) {
			matchImg.forEach(image => {
				text = text.replace(image, '');
				const tmp = image.replace("[CQ:image,file=", "").replace("]", "");
				if (tmp) {
					images.push(tmp);
				}
			});
		}
		if (matchVideo) {
			matchVideo.forEach(video => {
				text = text.replace(video, '');
				const tmp = video.replace("[CQ:video,file=", "").replace("]", "");
				if (tmp) {
					videos.push(tmp);
				}
			});
		}
		if (matchFile) {
			matchFile.forEach(file => {
				text = text.replace(file, '');
				const tmp = file.replace("[CQ:file,file=", "").replace("]", "");
				if (tmp) {
					files.push(tmp);
				}
			});
		}
		// TODO: 处理图片、视频、文件

		for (const image of images) {
			let path = "";
			if (image.startsWith("http") || image.startsWith("https://")) {
				const fileName = `${Date.now().toString() + this.randomString(5)}.png`;
				const res = await this.ggbDownloadUrl(image, fileName);
				console.log(res)
				path = res.path;
			}
			if (image.startsWith("base64://")) {
				const base64 = "data:image/png;base64," + image.replace("base64://", "");
				const fileName = `${Date.now().toString() + this.randomString(5)}.png`;
				const res = await this.ggbDownloadBase64(base64, fileName);
				path = res.path;
			}
			if (path) {
				const sendImgRes = await this.ggbSendImage(path, towxid);
				if (sendImgRes.state) {
					result.push(sendImgRes.timestamp)
					this.ggbDeleteFile(path)
				}
			}
		}

		for (const video of videos) {
			let path = "";
			if (video.startsWith("http") || video.startsWith("https://")) {
				const fileName = `${Date.now().toString() + this.randomString(5)}.mp4`;
				const res = await this.ggbDownloadUrl(video, fileName);
				console.log(res)
				path = res.path;
			}
			if (path) {
				// 按照疯小瑞说的，发送视频也用发送图片api
				const sendImgRes = await this.ggbSendImage(path, towxid);
				if (sendImgRes.state) {
					result.push(sendImgRes.timestamp)
					this.ggbDeleteFile(path)
				}
			}
		}

		for (const file of files) {

		}

		if (isGroup){
			// 	群艾特
			text = `@${nickName} ${text}`
			const atRes = await this.ggbGroupAt(towxid,[userID],text)
			if (atRes.state){
				result.push(atRes.timestamp)
			}
			return result
		}
		const sendRes = await this.ggbSendText(text,towxid);
		if (sendRes.state){
			result.push(sendRes.timestamp)
		}
		return result;
	}

	randomString(length:number){
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	async pushMessage(content:string,towxid:string){
		return await this.ggbSendText(content, towxid)
	}

	async parseXml(xml:string){
		return new Promise((resolve,reject)=>{
			xml2js.parseString(xml, (err, result) => {
				if (err) {
					reject(err)
				}
				resolve(result)
			});
		})
	}

	async ggbSendText(content:string,towxid:string){
		const {data} = await this.axios({
			method:"post",
			data: {"api": 1, towxid, content}
		})
		return data
	}

	async ggbSendImage(content:string,towxid:string){
		const {data} = await this.axios({
			method:"post",
			data: {"api": 2, towxid, content}
		})
		return data
	}

	async ggbQueryNickname(wxid:string){
		const {data} = await this.axios({
			method:"post",
			data: {"api":11,wxid}
		})
		return data
	}

	async ggbDownloadUrl(url:string,filename:string){
		const {data} = await this.axios({
			method:"post",
			data: {"api":20,url,filename}
		})
		return data
	}

	async ggbDeleteFile(path:string){
		const {data} = await this.axios({
			method:"post",
			data: {"api":22,path}
		})
		return data
	}

	async ggbDownloadBase64(base64:string,filename:string){
		const {data} = await this.axios({
			method:"post",
			data: {"api":24,"base64":base64,"filename":filename}
		})
		return data
	}

	async ggbTransfer(towxid:string,transferid:string,refund=false){
		const {data} = await this.axios({
			method:"post",
			data: {"api":10,towxid,"order":transferid,refund}
		})
		return data
	}

	async ggbGroupAt(towxid:string,atwxid:string[],content:string){
		const {data} = await this.axios({
			method:"post",
			data: {"api":25,towxid,atwxid,content}
		})
		return data
	}

};