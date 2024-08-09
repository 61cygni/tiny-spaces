import * as PIXI from 'pixi.js'

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
            wordWrapWidth: 224 // 256 - 2*padding 
        });
        this.container = new PIXI.Container();
        this.rrect = new PIXI.Graphics();
        this.container.addChild(this.rrect);
        
        this.pagepause = false;
        this.elapsed = 0;
        this.waitperiod = .25;
    }

    nextpage() {

        if (this.pagepause == true){
                this.startindex = this.endindex;
                this.pagepause = false;
        }else{
            //super hacky approach to filling out the page
            while (this.endindex++ < this.msg.length) {
                if (this.msgHeight() >= 98) { // 128 - 2*16
                    this.endindex--;// roll back to lasst character
                    this.displayText();
                    this.pagepause = true;
                    break;
                }
            }
            console.log("out of while loop "+this.endindex + " : " + this.startindex + " : " +this.msg.length);
            if (this.endindex >= this.msg.length) {
                this.finished = true;
            }
        }


    }

    // display on map
    arrive(top = true) {
        let topleftx = (640/2) - 120;
        let toplefty = 480 - (128 + 4);
        
        this.rrect.roundRect(topleftx, toplefty, 256, 128, 10);
        this.rrect.setStrokeStyle(2, 0xffd900, 1);
        this.rrect.fill(0x0)
            .stroke({ width: 2, color: 'white' });
        this.text = new PIXI.Text({text: "", style: this.style});
        this.text.x = topleftx + 16;
        this.text.y = toplefty + 16;
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
        newtext.x = topleftx + 16;
        newtext.y = toplefty + 16;
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
            if (this.msgHeight() >= 98) { // 128 - 2*16
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