import * as PIXI from 'pixi.js'


const DWIDTH = 256
const DHEIGHT = 96
const DPAD = 16
const TEXTPAUSE = .25
const MAXTHEIGHT = DHEIGHT - (2*DPAD)
const MAXTWIDTH  = DWIDTH  - (2*DPAD)

const DEFAULTFONTSIZE = 10;

export class Dialog{


    // tw = textwidth
    // pw = page width
    constructor(level, msg, pinned=false, place = 'bottom', callme = null,options = null){
        this.level = level

        this.frontsize = DEFAULTFONTSIZE;
        this.pad = DPAD;

        if(options && Object.hasOwn(options,'fontsize')){
            console.log("setting fontsize to "+options.fontsize);
            this.frontsize = options.fontsize;
        }
        if(options && Object.hasOwn(options,'pad')){
            console.log("setting padding to "+options.pad);
            this.pad = options.pad;
        }

        this.msg = msg;
        this.finished = false;
        this.startindex = 0;
        this.endindex   = 0;
        this.pinned = pinned; // don't remove on finished (used for chat)
        this.place = place;
        this.callme = callme;
        this.style = new PIXI.TextStyle({
            fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
            fontSize: this.frontsize,
            fill: "#ffffff",
            fontWeight: "bold",
            wordWrap: true,
            wordWrapWidth: MAXTWIDTH
        });
        this.container = new PIXI.Container();
        this.rrect = new PIXI.Graphics();
        this.container.addChild(this.rrect);
        
        this.pagepause = false;
        this.elapsed = 0;
        this.waitperiod = TEXTPAUSE;
    }

    append(text){
        this.msg = this.msg + text;
    }

    nextpage() {

        if (this.pagepause == true){
                this.startindex = this.endindex;
                this.pagepause = false;
        }else{
            while (this.endindex++ < this.msg.length) {
                if (this.msgHeight() >= MAXTHEIGHT) { 
                    this.endindex--;// roll back to lasst character
                    this.displayText();
                    this.pagepause = true;
                    break;
                }
            }
            this.displayText();
            if (this.endindex >= this.msg.length) {
                this.finished = true;
            }
        }


    }

    // display on map
    arrive() {

        let topleftx = (640/2) - 120;
        let toplefty = 480 - (DHEIGHT + 4);
        if(this.place == 'top'){
            toplefty = DPAD;
        }
        else if(this.place == 'topleft'){
            topleftx = DPAD;
            toplefty = DPAD;
        }
        else if(this.place == 'left'){
            topleftx = DPAD;
            toplefty = (480/2) - (DHEIGHT/2);
        }
        else if(this.place == 'inputbottom'){
            toplefty = (480) - (DHEIGHT+64);// FIXME should get input height from input.js
        }
        
        this.rrect.roundRect(topleftx, toplefty, DWIDTH, DHEIGHT, 10);
        this.rrect.setStrokeStyle(2, 0xffd900, 1);
        this.rrect.fill(0x0)
            .stroke({ width: 2, color: 'white' });
        this.text = new PIXI.Text({text: "", style: this.style});
        this.text.x = topleftx + DPAD;
        this.text.y = toplefty + DPAD;
        this.container.addChild(this.text);
        this.level.app.stage.addChild(this.container);
    }

    create_static(text, topleftx, toplefty, pad=8){
        let newcontainer = new PIXI.Container();
        this.text = new PIXI.Text({text: text, style: this.style});
        this.text.x = 0 + pad; 
        this.text.y = 0 + pad; 
        newcontainer.addChild(this.text);
        this.rrect.roundRect(0, 0, newcontainer.width + pad*2, newcontainer.height + pad*2, 10);
        this.rrect.setStrokeStyle(2, 0xffd900, 1);
        this.rrect.fill(0x0)
            .stroke({ width: 2, color: 'white' });
        console.log("newcontainer: ", newcontainer.width, newcontainer.height);
        newcontainer.removeChild(this.text);
        this.container.addChild(this.text);
        this.container.x = topleftx;
        this.container.y = toplefty;
    }

    leave() {
        this.level.app.stage.removeChild(this.container);
        this.container.removeChild(this.text);
        this.container.removeChild(this.rrect);
        if(this.text){
        this.text.destroy();
        }
        this.rrect.destroy();
        this.container.destroy();
        if(this.callme){
            this.callme();
        }
    }

    msgHeight(){
        let newtext = new PIXI.Text({ text: this.msg.substring(this.startindex, this.endindex), style: this.style });
        let ret = newtext.height; 
        newtext.destroy();
        return ret; 
    }
    displayText() {
        let appendme = "";
        if(this.pagepause && this.endindex != this.msg.length){
            appendme = "\n                <cont...>"

        }
        let newstr = this.msg.substring(this.startindex, this.endindex) + appendme;
        let newtext = new PIXI.Text({ text: newstr, style: this.style });
        newtext.x = this.text.x; 
        newtext.y = this.text.y; 
        let oldtext = this.text;
        this.text = newtext;
        this.container.removeChild(oldtext);
        this.container.addChild(this.text);
        oldtext.destroy();
    }

    tick(delta) {

        if(this.pagepause){
            this.elapsed = 0;
            return;
        }

        if(this.elapsed + delta < this.waitperiod){
            this.elapsed += delta;
            return;
        }

        this.elapsed = 0;
        
        if ((this.endindex - this.startindex) <= this.msg.length) {
            this.endindex++;
            if (this.msgHeight() >= MAXTHEIGHT) {
                this.endindex--;// roll back to last character
                this.pagepause = true;
                this.displayText();
            } else {
                this.displayText();
            }
            if (this.endindex >= this.msg.length) {
                this.finished = true;
            }
        }
    }


} // class Dialog