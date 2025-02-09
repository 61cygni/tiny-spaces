import * as PIXI from 'pixi.js';
import * as GLOBALS from '@spaced/globals.js';

import * as BEING from '../../spaced/being.js';

const Action = {};
Action[Action[0] = 'READ']    = 1;
Action[Action[1] = 'WALK']    = 2;
Action[Action[2] = 'THINK']   = 4;
Action[Action[3] = 'TALK']    = 8;

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
        this.curactiontime = 0;


        // create thinking bubble
        this.style = new PIXI.TextStyle({
            fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
            fontSize: 14, 
            fill: "#ffffff",
            fontWeight: "bold"
        });
        this.thinking = new PIXI.Text({text: "💭", style: this.style});
        this.reading = new PIXI.Text({text: "📖", style: this.style});
    }

    doWalk(delta){
        this.curactiontime-=delta;
        if(this.walk <= 0){
            let direction = Math.floor(Math.random() * 4);
            let dir = BEING.Dir[''+direction];
            this.goDir(dir);
            this.walk = Math.floor(Math.random() * 30) + 1;
        }else{
            if(this.timeToMove(delta)){
                this.walk--;
            }
        }
    }

    doThink(delta){
        this.curactiontime-=delta;
        if (!this.thinking.parent) {
            this.thinking.x = 0;
            this.thinking.y = -20;
            this.container.addChild(this.thinking);
        }
        if(this.curactiontime <= 0){
            this.container.removeChild(this.thinking);
        }
    }

    chatWithMainCharacter(char){
        this.action = 'TALK';
        this.curactiontime = 100000;
        this.stop();
        // HACK: remove thinking and reading bubbles
        this.container.removeChild(this.thinking);
        this.container.removeChild(this.reading);
    }

    endChatWithMainCharacter(){
        this.curactiontime = 0;
    }


    doTalk(delta){
        // do nothing
    }

    handle_input(input){
        console.log("Villager handle_input", input);
        return "I don't know what to say";
    }

    doRead(delta){
        this.curactiontime-=delta;
        if (!this.reading.parent) {
            this.reading.x = 0;
            this.reading.y = -20;
            this.container.addChild(this.reading);
        }
        if(this.curactiontime <= 0){
            this.container.removeChild(this.reading);
        }
    }

    chooseAction(){
        this.stop();
        this.action = Action[Math.floor(Math.random() * 3)];
        this.curactiontime = Math.floor(Math.random() * this.timebetweenactions) + 1;
        console.log(this.name + ' Action: ' + this.action + ' Time: ' + this.curactiontime);
    }

    tick(delta){
        if(!this.here){
            return;
        }
        if(this.curactiontime <=0 ){
            this.chooseAction();;
        }

        if(this.action == 'WALK'){
            this.doWalk(delta);
        }else if(this.action == 'THINK'){
            this.doThink(delta);
        }else if(this.action == 'READ'){
            this.doRead(delta);
        }else if(this.action == 'TALK'){
            this.doTalk(delta);
        }else{
            console.log('Unknown action: ' + this.action);
        }
        super.tick(delta);
    }
} // class Villager

