import * as PIXI from 'pixi.js';
import * as BEING from '@spaced/being.js';
import * as BT from '@spaced/bt.js';

import * as PROTO from './pentaproto.js';

export class VillagerActions{
    constructor(name, icon){
        // create thinking bubble
        this.style = new PIXI.TextStyle({
            fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
            fontSize: 14, 
            fill: "#ffffff",
            fontWeight: "bold"
        });
        this.name = name;
        this.icon = new PIXI.Text({text: icon, style: this.style});

        this.curactiontime = 0;
        this.villager = null;

        // position action icon slightly above the villager
        this.icon.x = 0;
        this.icon.y = -20;
    }

    doActionFor(time, villager){
        this.curactiontime = time;
        this.villager= villager;
        if (!this.icon.parent) {
            this.addIcon();
        }
    }

    timeLeft(){
        return this.curactiontime;
    }

    // by default just add the icon to the villager
    tick(delta){
        this.curactiontime-=delta;
        if(this.curactiontime <= 0){
            this.removeIcon();
        }
    }

    addIcon(){
        if(!this.icon.parent){
            this.villager.container.addChild(this.icon);
        }
    }

    removeIcon(){
        if(this.icon.parent){
            this.villager.container.removeChild(this.icon);
        }
    }

    done(){
        return this.curactiontime <= 0;
    }
}

export class WalkAction extends VillagerActions{
    constructor(){
        super("walk", "");
        this.walk = 0;
    }

    tick(delta){
        this.curactiontime-=delta;
        if(this.walk <= 0){
            let direction = Math.floor(Math.random() * 4);
            let dir = BEING.Dir[''+direction];
            this.villager.goDir(dir);
            this.walk = Math.floor(Math.random() * 30) + 1;
        }else{
            if(this.villager.timeToMove(delta)){
                this.walk--;
            }
        }
    }
}

export class ThinkAction extends VillagerActions{
    constructor(){
        super("think", "💭");
    }
}

export class ChatAction extends VillagerActions{
    constructor(){
        super("chat", "💬");
    }

    npc_bt_handle_response(name, count, response){
        // console.log("ChatAction: npc_bt_handle_response", response);
        let parsed = PROTO.parse_response(response);

        if(!parsed.msg){
            console.log("No message found in response");
            this.end_chat();
            return null;
        }
        window.gameLog.npcinfo(name, parsed.msg);

        if(count > 5){
            console.log("Too many messages, ending conversation");
            window.gameLog.npcinfo(name, "Ending conversation");
            this.end_chat();
            return null;
        }

        if(parsed.action){
            window.gameLog.actioninfo(name, "Action: " + parsed.action);
            if(parsed.action == "end conversation"){
                window.gameLog.npcinfo(name, "Ending conversation");
                this.end_chat();
                return null;
            }
        }
        return parsed;
    }

    // Response from source NPC
    handle_bt_synack_response(name, count, response){
        console.log("ChatAction: handle_bt_synack_response", response);
        let parsed = this.npc_bt_handle_response(name, count, response);
        if(!parsed){
            return;
        }
        if(!this.villager.chatting_with_npc){
            console.log("Received response from NPC, but have no counter party");
            this.end_chat();
            return;
        }
        const sysinput = {
            msg: parsed.msg,
        };
        BT.bt(this.villager.chatting_with_npc.slug, sysinput, this.handle_bt_syn_response.bind(this, this.villager.chatting_with_npc.name, count+1));
    }

    // Response from dest NCP
    handle_bt_syn_response(name, count, response){
        console.log("ChatAction: handle_bt_syn_response", response);
        let parsed = this.npc_bt_handle_response(name, count, response);
        if(!parsed){
            return;
        }
        const sysinput = {
            msg: parsed.msg,
        };
        BT.bt(this.villager.slug, sysinput, this.handle_bt_synack_response.bind(this, this.villager.name, count+1));
    }

    // Source NPC says basic hello to dest NPC
    say_hello(){
        let input = "hi";
        const sysinput = {
            msg: input,
        };
        BT.bt(this.villager.chatting_with_npc.slug, sysinput, this.handle_bt_syn_response.bind(this, this.villager.chatting_with_npc.name, 0));
        window.gameLog.npcinfo(this.villager.name, input);
    }

    doActionFor(time, villager){
        super.doActionFor(10000, villager);
        // console.log("ChatAction: doing action for ", time, villager);
        let v = villager.level.get_closest_being(villager, 200);
        if(!v){
            // console.log(villager.name, " has noone close to talk to");
            this.curactiontime = -1;
            return;
        }
        if(v.talking){
            console.log(v.name, " is talking to someone else");
            this.curactiontime = -1;
            return;
        }

        console.log(v.name, " is available to chat", v);

        if(v.curaction){
            v.curaction.removeIcon();
        }
        // Set target NPC into talking mode
        v.stop();
        v.talking = true; 
        v.curaction = v.Action['CHAT'];
        // call parent doActionFor on target NPC 
        VillagerActions.prototype.doActionFor.call(v.curaction, 1000000, v);

        v.chatting_with_npc = this.villager;

        this.villager.talking = true;
        this.villager.chatting_with_npc = v;

        console.log(this.villager.name, " is talking to ", v.name);
        this.say_hello();
    }

    end_chat(){
        window.gameLog.npcinfo(this.villager.name, "Ended conversation");
        console.log("Ending chat for ", this.villager);
        this.villager.endChatWithNPC();
    }
}

export class ReadAction extends VillagerActions{
    constructor(){
        super("read", "📖");
    }


}

export class BloodAction extends VillagerActions{
    constructor(){
        super("blood", "🩸");
    }
}

export class TalkAction extends VillagerActions{
    constructor(){
        super("talk", "");
    }
}