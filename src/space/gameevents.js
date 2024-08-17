import * as PIXI from 'pixi.js'

import * as DIALOG from './dialog.js'

class StaticBackground{

    // x,y are coordinates to return Alice too
    constructor(gevents, label, dialog, x, y) {
        this.label = label;
        this.gevents = gevents;
        this.finished = false;
        this.state = 0; // 0 fade out. 1 fade in. 
        this.dialog = dialog;
        this.x = x;
        this.y = y;
    }

    init() {
        // fade out main level
        this.fade = new FadeOut(this.gevents, this.label);
        this.gevents.being.leave();
    }

    tick(){
        if (!this.finished) {
            if(this.state == 0){ // fade out main level
                if(this.fade.finished){
                    this.fade.finalize();
                    this.fade  = new FadeIn(this.gevents, this.label, this.gevents.bg);
                    this.fade.init();
                    this.state = 1;
                }else{
                    this.fade.tick();
                }
            } else if(this.state == 1){ // fade in Alice's house 
                if(this.fade.finished){
                    this.gevents.level.app.stage.addChild(this.gevents.bg);
                    if(this.label == "house1"){
                        this.gevents.level.app.stage.addChild(this.gevents.vill1);
                    }
                    this.fade.finalize();
                    this.state = 2;
                }else{
                    this.fade.tick();
                }
            } else if(this.state == 2){ // dialog in Alice's house
                this.gevents.dialog_now(this.dialog);
                this.fade = new FadeOut(this.gevents, this.label);
                this.state = 3;
            } else if(this.state == 3){ // fade out
                if(this.fade.finished){
                    this.fade.finalize();
                    this.gevents.level.app.stage.removeChild(this.gevents.bg);
                    this.gevents.level.app.stage.removeChild(this.gevents.vill1);
                    this.fade  = new FadeIn(this.gevents, this.label, null);
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
    }

    destroy() {

    }

} // class StaticBackground

class FadeOut{

    constructor(gevents, label){
        this.label = label;
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

    constructor(gevents, label, bg){
        this.label = label;
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

        this.eventqueue = []; // queue of game events

        this.bg = null;
        initbg(this);
    }

    dialog_now(text) {
        let d = new DIALOG.Dialog(this.level, 42, 4, text);
        this.dstack.push(d);
        d.arrive();
    }

    handle_event(event) {
        if( this.dstack.length == 0 && this.eventqueue.length == 0){
            return false; // nothing to handle
        }
        if (event.code == 'Space') {
            event.preventDefault();

            if (this.dstack.length == 0){
                return;
            }
            if (this.dstack[0].finished) {
                this.dstack[0].leave();
                this.dstack.shift();
            } else {
                this.dstack[0].nextpage();
            }
        }
        return true;
    }

    checkLabel(x, y){
        if(!this.level){
            return;
        }
        let coordsx = Math.floor(x / 16);
        let coordsy = Math.floor((y+20) / 16);
        let ret = this.level.labeldict.get(""+coordsx+":"+coordsy);
        if (ret) {
            return ret.label;
        }
        return ret;
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
        } else {
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
                // only check labels if we're not currently processing an event
                if (this.beingx = !this.being.curanim.x || this.beingy != this.being.curanim.y) {
                    this.beingx = this.being.curanim.x;
                    this.beingy = this.being.curanim.y;
                    if (this.checkLabel(this.being.curanim.x, this.being.curanim.y) == 'house2') {
                        const dialog = "This is Alice's home.";
                        this.add_to_event_queue(new StaticBackground(this, "house2", dialog, 31*16, (9*16)+1));
                    }
                    else if (this.checkLabel(this.being.curanim.x, this.being.curanim.y) == 'house1') {
                        const dialog = "I wish I could help you more. I pray for your safety.";
                        this.add_to_event_queue(new StaticBackground(this, "house1", dialog, 11*16, (8*16)+1));
                    }
                }
            } // if eventqueue
        } // if d_stack_lenght
    }

} // class GameEvents