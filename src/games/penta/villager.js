import * as PIXI from 'pixi.js';
import * as GLOBALS from '@spaced/globals.js';

import * as BEING from '../../spaced/being.js';


// Super class for actions

class VillagerActions{
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
    }

    timeLeft(){
        return this.curactiontime;
    }

    // by default just add the icon to the villager
    tick(delta){
        this.curactiontime-=delta;
        if (!this.icon.parent) {
            this.villager.container.addChild(this.icon);
        }
        if(this.curactiontime <= 0){
            this.villager.container.removeChild(this.icon);
        }
    }

    done(){
        return this.curactiontime < 0;
    }
}

class WalkAction extends VillagerActions{
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

class ThinkAction extends VillagerActions{
    constructor(){
        super("think", "💭");
    }
}

class ReadAction extends VillagerActions{
    constructor(){
        super("read", "📖");
    }
}

class BloodAction extends VillagerActions{
    constructor(){
        super("blood", "🩸");
    }
}

class TalkAction extends VillagerActions{
    constructor(){
        super("talk", "");
    }
    tick(delta){
    }
}



export class Villager extends BEING.Being {
    constructor(name, slug, spritesheet, level) {
        super(spritesheet, level);
        this.name = name;
        this.slug = slug;
        this.focus = false;
        this.walk = 0;
        this.movedelta = .2;
        this.action = 'WALK';
        this.timebetweenactions = 100;

        this.curaction = null;

        this.conversation_history = [];
        this.conversation_history_max = 20; // includes both sides of the converstion 

        this.items = new Map();

        this.Action = {
            'WALK': new WalkAction(),
            'THINK': new ThinkAction(),
            'READ': new ReadAction(),
            'BLOOD': new BloodAction()
        };
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
        this.curaction = new TalkAction();
        this.curaction.doActionFor(100000, this);
        this.stop();
    }

    endChatWithMainCharacter(){
        this.curactiontime = 0;
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
        const randomKey = Object.keys(this.Action)[Math.floor(Math.random() * this.numActions)];
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

