import * as PIXI from 'pixi.js'

import { Input } from '@pixi/ui';

const DWIDTH = 256
const DHEIGHT = 48
const DPAD = 2
const MAXTHEIGHT = DHEIGHT - (2*DPAD)
const MAXTWIDTH  = DWIDTH  - (2*DPAD)

export class TextInput {

    // constructor(gevents, msg = 'enter text', callme = null){

    // options is an object that can contain:
    // - location : string on where to place the input box
    constructor(gevents, msg = 'enter text', callme = null, options = null){

        this.gevents = gevents;
        this.callme = callme; // call back for each time input is entered
        this.msg = msg;
        this.focus = false;

        this.location = options?.location || 'bottom';

        this.input = new Input({
            bg: new PIXI.Graphics()
            .roundRect(0, 0, DWIDTH, DHEIGHT, 11)
            .fill(0xDCB000)
            .roundRect(0 +2, 0+2, DWIDTH - 4, DHEIGHT - 4, 11)
            .fill(0xF1D583),
            textStyle: {
                fontFamily: "\"Trebuchet MS\", Helvetica, sans-serif",
                fontSize: 10,
                fill: 0,
                fontWeight: "bold",
                wordWrap: true,
                wordWrapWidth: DWIDTH - 8*DPAD 
            },
            placeholder: msg,
            value: '',
            padding: {
             top: 11,
             right: 11,
             bottom: 11,
             left: 11
            } ,
            cleanOnFocus: true
        });

        this.input.eventMode = 'static';
        this.input.onEnter.connect((val) => {
            console.log("Text input"+val);
            if(val == ""){
                console.log("Text input empty. Bailing");
                return;
            }
            if(this.callme){
                this.callme(val);
            }
            this.input.value = this.msg;
            this.gevents.pauseevents = false;
            this.leave();
        });
        this.input.onclick = (event) => {
            this.gevents.pauseevents = true;
        }

        if(this.location == 'mainchar'){
            this.input.x = 0;
            this.input.y = 64
            // this.input.x = (640/2) - (DWIDTH/2);
            // this.input.y = (480) - (DHEIGHT);
        }else{
            this.input.x = (640/2) - (DWIDTH/2);
            this.input.y = (480) - (DHEIGHT);
        }
    }

    arrive() {
        console.log("Adding text input");
        if(this.location == 'mainchar'){
            console.log("Adding text input mainchar");
            this.gevents.mainchar.container.addChild(this.input);
        }else{
            this.gevents.level.app.stage.addChild(this.input);
        }
    }

    leave() {
        console.log("Leaving text input");
        if(this.location == 'mainchar'){
            console.log("Leaving text input mainchar");
            this.gevents.mainchar.container.removeChild(this.input);
        }else{
            this.gevents.level.app.stage.removeChild(this.input);
        }
    }


}; // class TextInput
