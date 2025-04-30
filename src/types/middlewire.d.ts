declare module 'middleware' {
	// Sender 类
	export class Sender {
		constructor(senderID: string);

		bucketGet(bucket: string, key: string): Promise<any>;
		bucketSet(bucket: string, key: string, value: any): Promise<any>;
		bucketDel(bucket: string, key: string): Promise<any>;
		bucketKeys(bucket: string, value: any): Promise<any>;
		bucketAllKeys(bucket: string): Promise<any>;
		bucketAll(bucket: string): Promise<any>;
		setContinue(): Promise<any>;
		getRouterPath(): Promise<any>;
		getRouterParams(): Promise<any>;
		getRouterMethod(): Promise<any>;
		getRouterHeaders(): Promise<any>;
		getRouterCookies(): Promise<any>;
		getRouterBody(): Promise<any>;
		response(data: any): Promise<any>;
		getImtype(): Promise<any>;
		getUserID(): Promise<any>;
		getUserName(): Promise<any>;
		getUserAvatarUrl(): Promise<any>;
		getChatID(): Promise<any>;
		getGroupName(): Promise<any>;
		isAdmin(): Promise<any>;
		getMessage(): Promise<any>;
		getMessageID(): Promise<any>;
		getHistoryMessageIDs(number: number): Promise<any>;
		recallMessage(messageid: string): Promise<any>;
		breakIn(content: string): void;
		param(index: number): Promise<any>;
		reply(text: string): Promise<any>;
		edit(text: string): void;
		replyMarkdown(markdown: string): Promise<any>;
		replyImage(imageUrl: string): Promise<any>;
		replyVoice(voiceUrl: string): Promise<any>;
		replyVideo(videoUrl: string): Promise<any>;
		listen(timeout: number): Promise<any>;
		input(timeout: number, recallDuration?: number, forGroup?: boolean): Promise<string>;
		waitPay(exitcode: string, timeout: number): Promise<any>;
		atWaitPay(): Promise<any>;
		groupInviteIn(friend: string, group: string): void;
		groupKick(userid: string): void;
		groupBan(userid: string, timeout: number): void;
		groupUnban(userid: string): void;
		groupWholeBan(): void;
		groupWholeUnban(): void;
		groupNoticeSend(notice: string): void;
		getPluginName(): Promise<any>;
		getPluginVersion(): Promise<any>;
		getEventType(): Promise<any>;
		setEventType(eventType: string): Promise<any>;
		getEventData(): Promise<any>;
		setEventData(data: any): Promise<any>;
	}

	// Cron 类
	export class Cron {
		getCrons(): Promise<any>;
		getCron(id: string): Promise<any>;
		addCron(
			cron: string,
			cmd: string,
			isToSelf: boolean,
			toOthers: string[],
			memo: string,
			disguiseImtype: string,
			disguiseGroup: string,
			disguiseUser: string
		): void;
		updateCron(
			id: string,
			cron: string,
			cmd: string,
			isToSelf: boolean,
			toOthers: string[],
			memo: string
		): void;
		delCron(id: string): void;
	}

	// 导出函数
	export function addMsgListener(imtype: string, chatid: string, userid: string, callback: (response: string) => void): void;
	export function getSenderID(): string;
	export function render(template: string, selector: string, data: any): Promise<any>;
	export function getActiveImtypes(): Promise<any>;
	export function push(imType: string, groupCode: string, userID: string, title: string, content: string): void;
	export function name(): Promise<any>;
	export function domain(): Promise<any>;
	export function port(): Promise<any>;
	export function machineId(): Promise<any>;
	export function version(): Promise<any>;
	export function get(key: string): Promise<any>;
	export function set(key: string, value: any): Promise<any>;
	export function del(key: string): Promise<any>;
	export function bucketGet(bucket: string, key: string): Promise<any>;
	export function bucketSet(bucket: string, key: string, value: any): Promise<any>;
	export function bucketDel(bucket: string, key: string): Promise<any>;
	export function bucketKeys(bucket: string, value: any): Promise<any>;
	export function bucketAllKeys(bucket: string): Promise<any>;
	export function bucketAll(bucket: string): Promise<any>;
	export function notifyMasters(content: string, imtypes?: string[]): Promise<any>;
	export function coffee(): Promise<any>;
	export function spread(msg: string): Promise<any>;
	export function getHistoryMessages(imtype: string): Promise<any>;
}