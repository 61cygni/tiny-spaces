import * as PIXI from 'pixi.js';
import * as GLOBALS from '@spaced/globals.js';
import * as ACTIONS from './npc_actions.js';

import * as BEING from '../../spaced/being.js';


const NPC_CHAT = true; // can burn a lot of AI credits 
const TIME_BETWEEN_CHAT_SESSIONS = 500; // 10 seconds


export class Villager extends BEING.Being {
    constructor(name, slug, spritesheet, level) {
        super(spritesheet, level);
        this.name = name;
        this.slug = slug;
        this.focus = false;
        this.walk = 0;
        this.movedelta = .2;
        this.action = 'WALK';
        this.timebetweenactions = TIME_BETWEEN_CHAT_SESSIONS;
        this.talking = false;

        this.curaction = null;

        this.chatting_with_npc = null;
        this.skip_chat = 0; // used to skip a chat session

        this.conversation_history = [];
        this.conversation_history_max = 20; // includes both sides of the converstion 

        this.items = new Map();

        this.Action = {
            'WALK': new ACTIONS.WalkAction(),
            'THINK': new ACTIONS.ThinkAction(),
            'READ': new ACTIONS.ReadAction()
        };
        if(NPC_CHAT){
            this.Action['CHAT'] = new ACTIONS.ChatAction();
        }
        this.numActions = Object.keys(this.Action).length;

    }

    addItem(name, decsription){
        this.items.set(name, decsription);
    }

    getItem(name){
        return this.items.get(name);
    }

    hasItem(name){
        return this.items.has(name);
    }

    removeItem(name){
        this.items.delete(name);
    }

    getItems(){
        return Array.from(this.items.values());
    }

    getItemNames(){
        return Array.from(this.items.keys());
    }

    addToConversationHistory(name, message){
        this.conversation_history.push(name + ": " + message);
        if(this.conversation_history.length > this.conversation_history_max){
            this.conversation_history.shift();
        }
    }

    conversationHistoryAsText(){
        return this.conversation_history.join("\n");
    }

    chatWithMainCharacter(char){
        this.curaction = new ACTIONS.TalkAction();
        this.curaction.doActionFor(100000, this);
        this.talking = true;
        this.stop();
    }

    // chatWithNPC(npc){
    //     this.curaction = new ACTIONS.TalkAction();
    //     this.curaction.doActionFor(100000, this);
    //     this.talking = true;
    //     this.stop();
    //     this.chatting_with_npc = npc;
    //     npc.chatting_with_npc = this;
    // }

    endChatWithMainCharacter(){
        this.curactiontime = 0;
        this.talking = false;
    }

    endChatWithNPC(){
        if(this.chatting_with_npc){
            this.chatting_with_npc.talking = false;
            this.chatting_with_npc.curactiontime = -1;
            this.chatting_with_npc.curaction.removeIcon();
            this.chatting_with_npc.curaction = null;
            this.chatting_with_npc.chatting_with_npc = null;
            this.chatting_with_npc.skip_chat = 1;
            this.chatting_with_npc = null;
        }
        this.talking = false;
        this.curactiontime = -1;
        this.curaction.removeIcon();
        this.curaction = null;
        this.skip_chat = 1;
    }

    add_options(options){
        if(this.name == "jane"){
            options.haslocket = this.hasItem("locket");
        }
        return options;
    }

    arrive(x, y){
        super.arrive(x, y);
        if (window.gameLog) {
            window.gameLog.npcinfo(this.name,"added to the game at position ("+x+", "+y+")");
        }
    }

    // This should not be called and is a stub for testing. 
    handle_input(input){
        console.log("Villager handle_input", input);
        return "I don't know what to say";
    }

    chooseAction(){
        this.stop();
        let randomKey = Object.keys(this.Action)[Math.floor(Math.random() * this.numActions)];
        if(randomKey == 'CHAT' && this.skip_chat > 0){
            this.skip_chat--;
            randomKey = 'WALK'; // force a walk if skipping chat
        }
        this.curaction = this.Action[randomKey];
        this.curaction.doActionFor(Math.floor(Math.random() * this.timebetweenactions) + 1, this);
        // console.log(this.name + ' Action: ' + randomKey + ' time: ' + this.curaction.timeLeft());
    }

    tick(delta){
        if(!this.here){
            return;
        }
        if(!this.curaction){
            this.chooseAction();
        }

        this.curaction.tick(delta);

        if(this.curaction.done()){
            this.curaction = null;
        }

        super.tick(delta);
    }
} // class Villager

