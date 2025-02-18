import * as PIXI from 'pixi.js'

import * as GLOBALS from './globals.js';
import * as UIConfig from './uiconfig.js';

export class Dialog{

    // tw = textwidth
    // pw = page width
    constructor(ge, msg, pinned=false, place = 'bottom', callme = null,options = null){
        this.gameevents = ge;
        this.level = ge.level

        this.frontsize = UIConfig.DIALOG_DEFAULT_FONTSIZE;
        this.pad = UIConfig.DIALOG_PADDING;

        if(options && Object.hasOwn(options,'fontsize')){
            console.log("setting fontsize to "+options.fontsize);
            this.frontsize = options.fontsize;
        }
        if(options && Object.hasOwn(options,'pad')){
            console.log("setting padding to "+options.pad);
            this.pad = options.pad;
        }
        if(options && Object.hasOwn(options,'character')){
            //console.log("setting character to "+options.character);
            this.character = options.character;
        }
        if(options && Object.hasOwn(options,'gameevents')){
            console.log("setting gameevents to "+options.gameevents);
            this.gameevents = options.gameevents;
        }
        if(options && Object.hasOwn(options,'place')){
            console.log("setting place to "+options.place);
            this.place = options.place;
        }
        if(options && Object.hasOwn(options,'streaming')){
            this.streaming = options.streaming;
        }else{
            this.streaming = false;
        }
        // console.log("Streaming set to "+options.streaming);

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
            wordWrapWidth: UIConfig.DIALOG_MAX_WIDTH
        });
        this.container = new PIXI.Container();
        this.container.zIndex = GLOBALS.ZINDEX.DIALOG;
        this.container.sortableChildren = true;

        this.rrect = new PIXI.Graphics();
        this.container.addChild(this.rrect);
        
        this.pagepause = false;
        this.elapsed = 0;
        this.waitperiod = UIConfig.DIALOG_TEXT_PAUSE;

        // 
        this.appendcallback = null;
    }

    append(text, callback = null){
        this.msg = this.msg + text;
        this.callme = callback;
        //this.appendcallback = callback;
    }

    nextpage() {

        if (this.pagepause == true && !this.finished && this.endindex < this.msg.length - 2){
                // console.log("nextpage: pagepause true");
                // console.log("nextpage: endindex: "+this.endindex);
                // console.log("nextpage: msg.length: "+this.msg.length);
                this.startindex = this.endindex;
                this.pagepause = false;
        }else{
            // console.log("nextpage: pagepause false");
            // print endindex
            // console.log("endindex: "+this.endindex);    
            // console.log("msg.length: "+this.msg.length);
            while (this.endindex++ < this.msg.length) {
                if (this.msgHeight() >= (UIConfig.DIALOG_MAX_HEIGHT - (UIConfig.DIALOG_PADDING))) { 
                    console.log("nextpage: msgHeight() >= UIConfig.DIALOG_MAX_HEIGHT");
                    this.endindex--;// roll back to lasst character
                    this.pagepause = true;
                    this.displayText();
                    break;
                }
            }
            this.displayText();

            // console.log("this.streaming: "+this.streaming);
            // console.log("nextpage: endindex: "+this.endindex);
            // console.log("nextpage: msg.length: "+this.msg.length);  

            // if streaming, then we're still waiting for more of the message to show up
            if (!this.streaming && (this.endindex >= this.msg.length)) {
                // console.log("nextpage: endindex >= msg.length. Message finished");
                // console.log("streaming: "+this.streaming);
                this.finished = true;
                if(this.appendcallback){
                    console.log("firing appendcallback");
                    this.appendcallback();
                    this.appendcallback = null;
                }
            }
        }


    }

    // display on map
    arrive() {

        let topleftx = (640/2) - 120;
        let toplefty = 480 - (UIConfig.DIALOG_HEIGHT + 4);
        if(this.place == 'top'){
            toplefty = UIConfig.DIALOG_PADDING;
        }
        else if(this.place == 'topleft'){
            topleftx = UIConfig.DIALOG_PADDING;
            toplefty = UIConfig.DIALOG_PADDING;
        }
        else if(this.place == 'left'){
            topleftx = UIConfig.DIALOG_PADDING;
            toplefty = (480/2) - (UIConfig.DIALOG_HEIGHT/2);
        }
        else if(this.place == 'inputbottom'){
            toplefty = (480) - (UIConfig.DIALOG_HEIGHT+64);// FIXME should get input height from input.js
        }else if(this.place == 'character'){

            // Check first if input is active
            if(this.gameevents.mainchar.container.input){
                //convert to level coords
                let level_cx = this.character.container.x;
                let level_cy = this.character.container.y;
                let level_mx = this.gameevents.mainchar.worldx;
                let level_my = this.gameevents.mainchar.worldy;
                
                let level_newx = level_mx + UIConfig.DIALOG_TEXTINPUT_X_OFFSET; // snap to maincharacter location
                let level_newy = level_my - UIConfig.DIALOG_TEXTINPUT_Y_OFFSET; // position above input bar 

                // snap back to character coords
                topleftx = level_newx - level_cx;
                toplefty = level_newy - level_cy;
            }else{
                toplefty =  -48; // add to character container
                topleftx =  48;   // fixme magix number
            }
        }
        
        this.rrect.roundRect(topleftx, toplefty, UIConfig.DIALOG_WIDTH, UIConfig.DIALOG_HEIGHT, 10);
        this.rrect.setStrokeStyle(2, 0xffd900, 1);
        this.rrect.fill(0x0)
            .stroke({ width: 2, color: 'white' });
        this.text = new PIXI.Text({text: "", style: this.style});
        this.text.x = topleftx + UIConfig.DIALOG_PADDING;
        this.text.y = toplefty + UIConfig.DIALOG_PADDING;
        this.text.zIndex = GLOBALS.ZINDEX.DIALOG+1;

        this.container.addChild(this.text);
        this.container.sortChildren();

        if(this.place == 'character'){
            if(!this.character){
                    console.log("character container not found");
                    return;
            }
            this.character.container.addChild(this.container);
            this.charleftsprite = new PIXI.Sprite(this.character.sprites['LEFT'].textures[1]);
            this.charleftsprite.x = topleftx + UIConfig.DIALOG_MAX_WIDTH + 12 ;
            this.charleftsprite.y = toplefty + 48;
            this.charleftsprite.zIndex = GLOBALS.ZINDEX.DIALOG+1;
            this.character.container.addChild(this.charleftsprite);
        }else{
            this.level.app.stage.addChild(this.container);
        }
    }

    create_static(text, topleftx, toplefty, pad=8){
        let newcontainer = new PIXI.Container();
        newcontainer.zIndex = GLOBALS.ZINDEX.DIALOG;

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
        if(this.place == 'character'){
            this.character.container.removeChild(this.container);
            this.character.container.removeChild(this.charleftsprite);
            this.charleftsprite.destroy();
            this.charleftsprite = null;
        }else{
            this.level.app.stage.removeChild(this.container);
        }
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
        // The reason we check length -2 is 
        // endindex is an index, so starts at 0
        // we decrement it by 1 in the previous call in case we created a new line
        if(this.pagepause && this.endindex < this.msg.length - 2){
            // console.log("pagepause: "+this.pagepause);
            // console.log("endindex: "+this.endindex);
            // console.log("msg.length: "+this.msg.length);
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

    stream_done(){
        // called by client when the stream is complete
        this.streaming = false;
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
        
        if ((this.endindex - this.startindex) < this.msg.length) {
            this.endindex++;
            if (this.msgHeight() >= UIConfig.DIALOG_MAX_HEIGHT - (UIConfig.DIALOG_PADDING)) {
                console.log("TICK: msgHeight() >= UIConfig.DIALOG_MAX_HEIGHT");
                console.log("TICK: msgHeight(): "+this.msgHeight());
                console.log("TICK: UIConfig.DIALOG_MAX_HEIGHT: "+UIConfig.DIALOG_MAX_HEIGHT);
                this.endindex--;// roll back to last character
                this.pagepause = true;
                this.displayText();
            } else {
                // log endindex and message length
                // console.log("TICK: startindex: "+this.startindex);
                // console.log("TICK: endindex: "+this.endindex);
                // console.log("TICK: msg.length: "+this.msg.length);
                this.displayText();
            }
            if (!this.streaming && (this.endindex >= this.msg.length)) {
                this.finished = true;
                if(this.appendcallback){
                    console.log("firing appendcallback");
                    this.appendcallback();
                    this.appendcallback = null;
                }
            }
        }
    }


} // class Dialog