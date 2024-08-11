import * as PIXI from 'pixi.js'

import * as DIALOG from './dialog.js'

async function initbg(gevents) {
        const texture = await PIXI.Assets.load("./ps1/camineet-house-bg.png");
        gevents.bg =  new PIXI.Sprite(texture); 
        gevents.bg.width  = 640;
        gevents.bg.height = 480;
}

export class GameEvents {

    constructor(being) {
        this.being = being
        this.beingx = being.curanim.x
        this.beingy = being.curanim.y
        this.level = being.level;
        this.dstack = [];

        this.bg = null;
        initbg(this);
    }

    dialog_now(text) {
        let d = new DIALOG.Dialog(this.level, 42, 4, text);
        this.dstack.push(d);
        d.arrive();
    }

    handle_event(event) {
        if (event.code == 'Space') {
            event.preventDefault();
            if (this.dstack[0].finished) {
                this.dstack[0].leave();
                // TODO: remove dialog from stack (also this is a queue not a stack)
            } else {
                this.dstack[0].nextpage();
            }
        }
    }

    checkLabel(x, y){
        if(!this.level){
            return;
        }
        let coordsx = Math.floor(x / 16);
        let coordsy = Math.floor((y+20) / 16);
        console.log(this.level.labeldict.get(""+coordsx+":"+coordsy));
        let ret = this.level.labeldict.get(""+coordsx+":"+coordsy);
        if (ret) {
            return ret.label;
        }
        return ret;
    }

    tick(delta){
        this.dstack[0].tick(delta);

        if (this.beingx = !this.being.curanim.x || this.beingy != this.being.curanim.y) {
            this.beingx = this.being.curanim.x;
            this.beingy = this.being.curanim.y;
            if(this.checkLabel(this.being.curanim.x, this.being.curanim.y) == 'house2'){
                console.log("WOOO!"+this.bg);
                this.level.app.stage.addChild(this.bg);
            }
        }
    }

} // class GameEvents