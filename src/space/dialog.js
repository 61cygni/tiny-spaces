import * as PIXI from 'pixi.js'


const DWIDTH = 256
const DHEIGHT = 128
const DPAD = 16
const TEXTPAUSE = .25
const MAXTHEIGHT = DHEIGHT - (2*DPAD)
const MAXTWIDTH  = DWIDTH  - (2*DPAD)

export class Dialog{


    // tw = textwidth
    // pw = page width
    constructor(level,  tw=42, pw = 4, msg ){
        this.level = level
        this.tw = tw;
        this.pw = pw;
        this.msg = msg;
        this.finished = false;
        this.startindex = 0;
        this.endindex   = 0;
        this.style = new PIXI.TextStyle({
            fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
            fontSize: 12,
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

    nextpage() {

        if (this.pagepause == true){
                this.startindex = this.endindex;
                this.pagepause = false;
        }else{
            //super hacky approach to filling out the page
            while (this.endindex++ < this.msg.length) {
                if (this.msgHeight() >= MAXTHEIGHT) { 
                    this.endindex--;// roll back to lasst character
                    this.displayText();
                    this.pagepause = true;
                    break;
                }
            }
            if (this.endindex >= this.msg.length) {
                this.finished = true;
            }
        }


    }

    // display on map
    arrive(top = true) {
        let topleftx = (640/2) - 120;
        let toplefty = 480 - (DHEIGHT + 4);
        
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

    leave() {
        this.level.app.stage.removeChild(this.container);
        this.container.removeChild(this.text);
        this.container.removeChild(this.rrect);
        this.text.destroy();
        this.rrect.destroy();
        this.container.destroy();
    }

    msgHeight(){
        let newtext = new PIXI.Text({ text: this.msg.substring(this.startindex, this.endindex), style: this.style });
        let ret = newtext.height; 
        newtext.destroy();
        return ret; 
    }
    displayText() {
        let topleftx = (640 / 2) - 120;
        let toplefty = 480 - (128 + 4);
        let newtext = new PIXI.Text({ text: this.msg.substring(this.startindex, this.endindex), style: this.style });
        newtext.x = topleftx + DPAD;
        newtext.y = toplefty + DPAD;
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