import * as PIXI from 'pixi.js'

import * as DIALOG from './dialog.js'
import * as INPUT from './input.js'

// -- 
// -- 
export class ChangeLevel {
    constructor(name, gevents) {
        this.finished = false;
        this.name = name;
        this.gevents = gevents;
    }
    init() {
        this.fade = new FadeOut(this.gevents);
    }

    tick() {
        if (!this.finished) {
            if (this.fade.finished) {
                this.fade.finalize();
                this.finished = true;
                return this.name
            } else {
                this.fade.tick();
            }
        }
    }

    finalize() {

    }
    }// class ChangeLevel

// -- 
// "Parent" class (doesn't use inheritence uses composition) that
// is a state machine for displaying a static scene in the level. This
// is used for hoses, shops, church's battles, etc. 
// -- 
export class StaticBackground {

    // x,y are coordinates to return Alice too
    constructor(logic, gevents, x = null, y = null) {
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
        this.gevents.alis.leave();
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
        if(this.x != null){
            this.gevents.alis.arrive(this.x,this.y);
        }else{
            this.gevents.alis.arrive(this.gevents.alis.worldx, this.gevents.alis.worldy);
        }
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

export class FadeIn{

    constructor(gevents, bg = null){
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

// --
// Per scene event haness. Manages dialogs, input, label handler callbacks, etc.
// --
export class GameEvents {

    constructor(alis) {
        this.alis = alis
        this.alisoldx = alis.worldx
        this.alisoldy = alis.worldy
        this.level = alis.level;
        this.dqueue = [];

        this.pauseevents = false;

        this.esc = false; // has the escape key been pressed?
        this.esc_handler = null; // fired when escape key is pressed

        this.eventqueue = []; // queue of game events
        this.label_handlers = new Map();

        this.bg = null;
        this.input = null;
    }

    // called when Alis enters a new level
    reset(alis) {
        this.alis = alis
        this.alisoldx = alis.worldx
        this.alisoldy = alis.worldy
        this.level = alis.level;
        this.dqueue = [];

        this.pauseevents = false;

        this.esc = false; // has the escape key been pressed?
        this.esc_handler = null; // fired when escape key is pressed

        this.eventqueue = []; // queue of game events
        this.label_handlers = new Map();

        this.bg = null;
        this.input = null;
    }

    // --
    // Display a dialog on the screen. Uses a stack to manage multiple dialog requests
    // -- 
    dialog_now(text = "", place = 'bottom', callme = null, pinned = false) {
        // if an existing dialog is up and finished, clean it up
        if (this.dqueue.length > 0 && this.dqueue[0].finished) {
            this.dqueue[0].leave();
            this.dqueue.shift();
        }

        // if an existing dialog is up and pinned, append to that dialog
        if (this.dqueue.length > 0 && this.dqueue[0].pinned) {
            this.dqueue[0].append("\n\n"+text);
        } else {
            let d = new DIALOG.Dialog(this.level, text, pinned, 42, 4, place, callme);
            this.dqueue.push(d);
            d.arrive();
        }
    }

    // Stream to a dialog
    dialog_stream(text = "", place = 'bottom') {
        // if an existing dialog is up and finished, clean it up
        if (this.dqueue.length > 0 && this.dqueue[0].finished) {
            this.dqueue[0].leave();
            this.dqueue.shift();
        }

        // if an existing dialog is up and pinned, append to that dialog
        if (this.dqueue.length > 0 && this.dqueue[0].pinned) {
            this.dqueue[0].append(text);
        } else {
            let d = new DIALOG.Dialog(this.level, text, true, 42, 4, place, null);
            this.dqueue.push(d);
            d.arrive();
        }
    }

    dialog_stream_done() {
        if (this.dqueue.length < 1 || !this.dqueue[0].pinned) {
            console.log("dialog_stream_done called with no active dialog. Bailing");
            return;
        }
        this.dqueue[0].pinned = false;
    }

    // --
    // Delete all pending dialogs
    // -- 
    clear_dialogs(){
        while(this.dqueue.length){
            let d = this.dqueue.shift();
            d.leave();
        }
    }

    // --
    // Pop up text box for user input 
    // -- 
    input_now(text, callme){
        this.input = new INPUT.TextInput(this, text, callme);
        this.input.arrive();
    }

    input_leave(){
        if (this.input) {
            this.input.leave();
        }
    }


    // -- 
    // keyboard handler for managing dialog paging etc.
    // --
    handle_event(event) {
        if( this.dqueue.length == 0 && this.eventqueue.length == 0){
            return false; // nothing to handle
        }
        if (event.code == 'Space') {
            event.preventDefault();

            if (this.dqueue.length == 0){
                return;
            }
            else if (this.dqueue[0].finished) {
                if (!this.dqueue[0].pinned) {
                    this.dqueue[0].leave();
                    this.dqueue.shift();
                }
            } else {
                this.dqueue[0].nextpage();
            }
        }
        return true;
    }

    handle_escape(){
        this.esc = true;
    }

    // -- 
    // Determine if Alis is on a label on the map. If so return label
    // --
    checkLabel(x, y){
        if(!this.level){
            return null;
        }

        let coordsx = Math.floor(x / this.level.tiledimx);
        let coordsy = Math.floor((y+20) / this.level.tiledimy); // FIXME MAGIC #
        let ret = this.level.labeldict.get(""+coordsx+":"+coordsy);
        if (ret) {
            console.log("Found label "+ ret.label+ " x:"+coordsx+" y:"+coordsy);
            return ret.label;
        }
        return null;
    }

    // --
    // To be called when Alis steps on a label
    // --
    register_label_handler(label, handler) {
        this.label_handlers.set(label, handler);
    }

    register_esc_handler(handler){
        this.esc_handler = handler;
    }

    clear_esc_handler(handler){
        this.esc_handler = null;
    }

    // --
    // Even alis called per tick
    // --
    add_to_tick_event_queue(task) {
        this.eventqueue.push(task);
        if (this.eventqueue.length == 1) {
            this.eventqueue[0].init();
        }
    }

    // --
    // Main per-scene game loop
    // Sequence:
    // 
    // 1. Tick dialog first
    // 2. Tick event queue next 
    // 3. If event queue is empty check labels and fire handlers
    // 4. if no handlers fired, check if esc key was hit, in which case fire escape handler
    //
    // --
    tick(delta) {


        // handle dialog queue first. 
        if (this.dqueue.length > 0) {
            this.dqueue[0].tick(delta);
        } 

        if (this.eventqueue.length > 0) {
            if (!this.eventqueue[0].finished) {
                let ret = this.eventqueue[0].tick();
                if(ret != null){
                    return ret; // events only return if a new level is being loaded.
                }
            } else {
                let event = this.eventqueue.shift();;
                if (this.eventqueue.length > 0) {
                    this.eventqueue[0].init();
                }
                event.finalize();
            }
        } else {

            let firedhandler = false;
            if (this.alisoldx != this.alis.worldx || this.alisoldy != this.alis.worldy) {
                this.alisoldx = this.alis.worldx;
                this.alisoldy = this.alis.worldy;

                // check current x,y to see if there is a label. And if so if we have a handler.
                const label = this.checkLabel(this.alis.worldx, this.alis.worldy);
                // XXX FIXME. Currently linear search through all lable handlers. Should be constant time
                //            lookup.
                if (label) {
                    for (let [key, value] of this.label_handlers) {
                        if (label == key) {
                            firedhandler = true;
                            this.add_to_tick_event_queue(value);
                        }
                    }
                }
            }
            if(!firedhandler && this.esc){
                if(this.esc_handler){
                    this.add_to_tick_event_queue(this.esc_handler);
                    this.esc = false;
                }
            }
        } // if eventqueue
    } // Tick (main loop)

} // class GameEvents