/**
 * @Time: 2025/5/3 14:21
 * @Author: 魂焱
 * @File: QQ1WsAdapter.ts
 * @Software: WebStorm
 * @Description:
 */
import {WsAdapter} from "../../common/WsAdapter";

export class QQ1WsAdapter extends WsAdapter {
    protected async init(): Promise<boolean> {
		// init支持Promise,此处模拟有异步任务的初始化，比如网络请求之类的操作，可使用async和await
		return await this.fakeAsync() as boolean;
    }
    protected ImHandle(data: any, sendAut: (data: object) => void, sendIm: (data: any) => void): void | Promise<void> {
		console.log(`Received from ncqq: ${data}`);
		try {
			const messageJson = JSON.parse(data);
			if ("self_id" in messageJson && "message" in messageJson) {
				const commsg:Record<string, any> = {
					bot_id: messageJson['self_id'].toString(),
					user_id: messageJson['sender']['user_id'].toString(),
					user_name: messageJson["sender"]["nickname"],
					im_type: this.adapterName,
					message_id: messageJson['message_id'].toString(),
					content: messageJson["message"],
					raw_message: messageJson["raw_message"]
				};
				if (messageJson["message_type"] === "group") {
					if (messageJson['group_id']==735467280) {
						return;
					}
					commsg["chat_id"] = messageJson['group_id']?.toString();
				}
				sendAut(commsg);
			} else if ("retcode" in messageJson && "data" in messageJson && "message_id" in messageJson["data"]) {
				const replyMessage = {
					aut_echo: messageJson['echo'],
					aut_params: messageJson['data']['message_id'].toString()
				};
				sendAut(replyMessage);
			}
		} catch (error) {
			console.log(`JSON parsing error from ncqq: ${data}`);
			throw error;
		}
    }

    protected autHandle(data: any, sendAut: (data: object) => void, sendIm: (data: any) => void): void | Promise<void> {
        if ("aut_echo" in data){
			if (data["aut_action"] === "reply_message" || data["aut_action"] === "push_message") {
				const autEcho = data["aut_echo"];
				const replyMessage:Record<string, any> = {
					action: "send_private_msg",
					echo: autEcho,
					params: {
						user_id: parseInt(data["aut_params"]["user_id"]),
						message: data['aut_params']['content'],
					}
				};
				if ("chat_id" in data["aut_params"] && data["aut_params"]["chat_id"]!== "") {
					replyMessage.action = "send_group_msg";
					replyMessage.params.group_id = parseInt(data["aut_params"]["chat_id"]);
				}
				sendIm(JSON.stringify(replyMessage));
			} else if (data["aut_action"] === "delete_message" && "aut_params" in data && "message_id" in data["aut_params"]) {
				const replyMessage = {
					action: "delete_msg",
					params: {
						message_id: parseInt(data["aut_params"]["message_id"])
					}
				};
				sendIm(JSON.stringify(replyMessage));
			}
		}
    }

	fakeAsync(){
		return new Promise((resolve, reject) => {
			setTimeout(()=>{
				if (!this.imWsAddr){
					resolve(false);
				}
				resolve(true);
			},1000)
		});
	}
}
