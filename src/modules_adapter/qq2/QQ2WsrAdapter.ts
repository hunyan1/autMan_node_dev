/**
 * @Time: 2025/5/3 23:19
 * @Author: 魂焱
 * @File: QQ2WsrAdapter.ts
 * @Software: WebStorm
 * @Description:
 */
import {HttpAdapter} from "../../common/HttpAdapter";

// 反向ws的逻辑与http相同，im消息都是从autMan处过来，只是http适配器需要作者通过http请求发送给im，ws适配器则不需要，直接发送给autMan即可
class QQ2WsrAdapter extends HttpAdapter {
	protected init(): boolean {
		return true
	}

	protected ImHandle(data: any, sendAut: (data: object) => void): void | Promise<void> {
		if (data.retcode && data.data?.message_id) {
			// 处理回执消息
			const receiptMsg = {
				aut_echo: data.echo,
				aut_params: `${data.data.message_id}`
			};
			sendAut(receiptMsg);
			return;
		}
        // 处理收到的QQ消息
		if (data.self_id && data.message) {
			const forwardMsg:Record<string, any> = {
				bot_id: `${data.self_id}`,
				user_id: `${data.sender.user_id}`,
				user_name: data.sender.nickname,
				im_type: this.adapterName,
				message_id: `${data.message_id}`,
				content: data.message,
				raw_message: data.raw_message
			};

			// 群消息特殊处理
			if (data.message_type === "group") {
				if (data.group_id == 735467280) return; // 跳过特定群
				forwardMsg.chat_id = `${data.group_id}`;
			}

			sendAut(forwardMsg)
		}
	}

	protected autHandle(data: any, sendAut: (data: object) => void): void | Promise<void> {
		if (data.aut_action === "reply_message" || data.aut_action === "push_message") {
			const replyMsg: Record<string, any> = {
				action: "send_private_msg",
				echo: data.aut_echo,
				params: {
					user_id: parseInt(data.aut_params.user_id),
					message: data.aut_params.content
				}
			};
			// 群回复处理
			if (data.aut_params.chat_id && data.aut_params.chat_id !== "") {
				replyMsg.action = "send_group_msg";
				replyMsg.params.group_id = parseInt(data.aut_params.chat_id);
			}
			sendAut(replyMsg);
		} else if (data.aut_action === "delete_message" && data.aut_params?.message_id) {
            // 处理撤回消息
			const deleteMsg = {
				action: "delete_msg",
				params: {message_id: parseInt(data.aut_params.message_id)}
			};
			sendAut(deleteMsg)
		}
	}

}