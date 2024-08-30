import * as PIXI from 'pixi.js'

import * as DIALOG from './dialog.js'
import * as INPUT from './input.js'

export class StaticBackground {

    // x,y are coordinates to return Alice too
    constructor(logic, gevents, x, y) {
        this.logic = logic;
        this.gevents = gevents;
        this.finished = false;
        this.state = 0; // 0 fade out. 1 fade in. 
        this.x = x;
        this.y = y;
        this.doinput = false;
    }


    init() {
        this.logic.init(this);
        // fade out main level
        this.fade = new FadeOut(this.gevents);
        this.gevents.being.leave();
        this.finished = false;
    }

    tick(){
        if (!this.finished) {
            if(this.state == 0){ // fade out main level
                if(this.fade.finished){
                    this.fade.finalize();
                    this.fade  = new FadeIn(this.gevents, this.logic.bg);
                    this.fade.init();
                    this.state = 1;
                }else{
                    this.fade.tick();
                }
            } else if(this.state == 1){ // fade in Alice's house 
                if(this.fade.finished){
                    this.logic.add_start_scene();
                    this.fade.finalize();
                    this.state = 2;
                }else{
                    this.fade.tick();
                }
            } else if(this.state == 2){ // dialog in Alice's house
                if (!this.logic.tick()){
                    this.fade = new FadeOut(this.gevents);
                    this.state = 3;
                }
            } else if(this.state == 3){ // fade out
                if(this.fade.finished){
                    this.fade.finalize();
                    this.logic.remove_scene();
                    this.gevents.clear_dialogs();
                    this.fade  = new FadeIn(this.gevents, null);
                    this.fade.init();
                    this.state = 4;
                }else{
                    this.fade.tick();
                }
            } else if(this.state == 4){ // fade in level
                if(this.fade.finished){
                    this.fade.finalize();
                    this.finished = true;
                }else{
                    this.fade.tick();
                }
            }
        }
    }

    finalize() {
        this.gevents.being.arrive(this.x,this.y);
        this.state = 0;
        this.finished = true;
    }

} // class StaticBackground


class FadeOut{

    constructor(gevents){
        this.gevents = gevents;
        this.startalpha = 0;
        this.endalpha   = 1;
        this.alphadelta = .025;
        this.alpha = this.startalpha;
        this.gfx = null;
        this.finished = false;
    }

    init() {
        // empty
    }

    tick(){
        if(this.alpha <= this.endalpha){
            this.alpha += this.alphadelta;

            let newgfx = new PIXI.Graphics();
            newgfx.rect(0, 0, 640, 480);
            newgfx.fill({color: 0x000000, alpha: this.alpha});
            this.gevents.level.app.stage.addChild(newgfx);
            if (this.gfx) {
                this.gevents.level.app.stage.removeChild(this.gfx);
                this.gfx.destroy();
            }
            this.gfx = newgfx;
        }else{
            this.finished = true;
        }
    }

    finalize() {
        if (this.gfx) {
            this.gevents.level.app.stage.removeChild(this.gfx);
            this.gfx.destroy();
        }
    }

} // class FadeOut

class FadeIn{

    constructor(gevents, bg){
        this.gevents = gevents;
        this.startalpha = 1;
        this.endalpha   = 0;
        this.alphadelta = .010;
        this.alpha = this.startalpha;
        this.gfx = null;
        this.bg = bg;
        this.finished = false;

        this.container = new PIXI.Container();
    }

    init() {
        if (this.bg) {
            this.container.addChild(this.bg);
        }
        this.gfx = new PIXI.Graphics();
        this.gfx.rect(0, 0, 640, 480);
        this.gfx.fill({color: 0x000000, alpha: this.alpha});
        this.container.addChild(this.gfx);
        this.gevents.level.app.stage.addChild(this.container);
    }

    tick(){
        if(this.alpha >= this.endalpha){
            this.alpha -= this.alphadelta;

            let newgfx = new PIXI.Graphics();
            newgfx.rect(0, 0, 640, 480);
            newgfx.fill({color: 0x000000, alpha: this.alpha});
            this.container.addChild(newgfx);
            if (this.gfx) {
                this.container.removeChild(this.gfx);
                this.gfx.destroy();
            }
            this.gfx = newgfx;
        }else{
            this.finished = true;
        }
    }

    finalize() {
        if (this.gfx) {
            this.gevents.level.app.stage.removeChild(this.container);
            this.container.destroy();
        }
    }

} // class FadeIn

async function initbg(gevents) {
        const txtbg    = await PIXI.Assets.load("./ps1/camineet-house-bg.png");
        const txtvill1 = await PIXI.Assets.load("./ps1/villager-1.png");
        gevents.bg    =  new PIXI.Sprite(txtbg); 
        gevents.bg.width  = 640;
        gevents.bg.height = 480;
        gevents.vill1 =  new PIXI.Sprite(txtvill1); 
        gevents.vill1.width  = 80;
        gevents.vill1.height = 218;
        gevents.vill1.x = 280;
        gevents.vill1.y = 180;

}

export class GameEvents {

    constructor(being) {
        this.being = being
        this.beingx = being.curanim.x
        this.beingy = being.curanim.y
        this.level = being.level;
        this.dstack = [];

        this.pauseevents = false;
        this.esc = false; // has the escape key been pressed?

        this.eventqueue = []; // queue of game events
        this.label_handlers = new Map();

        this.bg = null;
        this.input = null;

        initbg(this);
    }

    dialog_now(text = "", place = 'bottom', callme = null, pinned = false) {
        // if an existing dialog is up and finished, clean it up
        if (this.dstack.length > 0 && this.dstack[0].finished) {
            this.dstack[0].leave();
            this.dstack.shift();
        }

        // if an existing dialog is up and pinned, append to that dialog
        if (this.dstack.length > 0 && this.dstack[0].pinned) {
            this.dstack[0].append(text);
        } else {
            console.log("New Dialog!");
            let d = new DIALOG.Dialog(this.level, text, pinned, 42, 4, place, callme);
            this.dstack.push(d);
            d.arrive();
        }
    }

    clear_dialogs(){
        while(this.dstack.length){
            let d = this.dstack.shift();
            d.leave();
        }


    }

    input_now(text, callme){
        this.input = new INPUT.TextInput(this, text, callme);
        this.input.arrive();
    }

    input_leave(){
        console.log("INPUT_LEAVE "+this.input);
        if (this.input) {
            this.input.leave();
        }
    }


    handle_event(event) {
        if( this.dstack.length == 0 && this.eventqueue.length == 0){
            return false; // nothing to handle
        }
        if (event.code == 'Space') {
            event.preventDefault();

            console.log("gevent sPACE"); 

            if (this.dstack.length == 0){
                return;
            }
            else if (this.dstack[0].finished) {
                if (!this.dstack[0].pinned) {
                    this.dstack[0].leave();
                    this.dstack.shift();
                }
            } else {
                this.dstack[0].nextpage();
            }
        }
        return true;
    }

    checkLabel(x, y){
        if(!this.level){
            return null;
        }
        let coordsx = Math.floor(x / 16);
        let coordsy = Math.floor((y+20) / 16);
        let ret = this.level.labeldict.get(""+coordsx+":"+coordsy);
        if (ret) {
            console.log("Found label "+ ret.label+ " x:"+coordsx+" y:"+coordsy);
            return ret.label;
        }
        return null;
    }

    register_label_handler(label, handler) {
        this.label_handlers.set(label, handler);
    }

    add_to_event_queue(task) {
        this.eventqueue.push(task);
        if (this.eventqueue.length == 1) {
            this.eventqueue[0].init();
        }
    }

    tick(delta){

        // handle dialog queue first. 
        if(this.dstack.length > 0){
         this.dstack[0].tick(delta);
        } 

        if (this.eventqueue.length > 0) {
            if (!this.eventqueue[0].finished) {
                this.eventqueue[0].tick();
            } else {
                let event = this.eventqueue.shift();;
                if (this.eventqueue.length > 0) {
                    this.eventqueue[0].init();
                }
                event.finalize();
            }
        } else {
            // FIXME!! Only need to check if moved 
            if (this.being.x != this.being.curanim.x || this.being.y != this.being.curanim.y) {
                this.being.x = this.being.curanim.x;
                this.being.y = this.being.curanim.y;

                // check current x,y to see if there is a label. And if so if we have a handler.
                const label = this.checkLabel(this.being.curanim.x, this.being.curanim.y);
                if (label) {
                    for (let [key, value] of this.label_handlers) {
                        if (label == key) {
                            this.add_to_event_queue(value);
                        }
                    }
                }
            }
        } // if eventqueue
    }

} // class GameEvents