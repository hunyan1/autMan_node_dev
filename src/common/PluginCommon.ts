import {Sender} from "middleware";

export abstract class PluginCommon {
    protected sender: Sender;
    constructor(sender:Sender) {
        this.sender = sender;
    }

	abstract run(): Promise<void>;

	wait(time:number,time2?:number,){
		if(time2){
			time = Math.floor(Math.random() * (time2 - time + 1) + time)
		}
		return new Promise((resolve)=>[
			setTimeout(resolve,time)
		])
	}

}