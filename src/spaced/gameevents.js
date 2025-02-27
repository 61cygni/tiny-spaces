import * as PIXI from 'pixi.js'

import * as DIALOG from './dialog.js'
import * as INPUT from './input.js'
import * as SCREEN from './screen.js'

// --
// Most basic handler stub
// --  

export class RawHandler{
    constructor(gevents){
        this.gevents = gevents;
        this.finished = true; // default to finished
    }

    init(){
        // empty
    }

    tick(delta){
        // empty
    }

    finalize(){
        // empty
    }
}

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

    tick(delta) {
        if (!this.finished) {
            if (this.fade.finished) {
                this.fade.finalize();
                this.finished = true;
                return this.name
            } else {
                this.fade.tick(delta);
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
        this.next_in_chain = null; // next StaticBackground if chained


        // if not null, tick will return the string of a new level.
        this.tick_return_new_level = null;
    }


    init() {
        this.logic.init(this);
        // fade out main level

        this.fade = new FadeOut(this.gevents);
        if (this.gevents.mainchar) {
            this.gevents.mainchar.leave();
        }
        this.finished = false;
    }

    chain(next) {
        this.next_in_chain = next;
        return next;
    }

    tick(delta) {
        if(this.tick_return_new_level != null){
            this.finished = true;
            return this.tick_return_new_level;
        }
        if (!this.finished) {
            if(this.state == 0){ // fade out main level
                if(this.fade.finished){
                    this.fade.finalize();
                    this.fade  = new FadeIn(this.gevents, this.logic.bg);
                    this.fade.init();
                    this.state = 1;
                }else{
                    this.fade.tick(delta);
                }
            } else if(this.state == 1){ // fade in scene 
                if(this.fade.finished){
                    this.logic.add_start_scene();
                    this.fade.finalize();
                    this.state = 2;
                }else{
                    this.fade.tick(delta);
                }
            } else if(this.state == 2){ // run scene specific logic 
                if (!this.logic.tick(delta)){
                    if (this.next_in_chain) {
                        // will handle fading out next scene
                        this.gevents.add_to_tick_event_queue(this.next_in_chain);
                        this.state = 4;
                    } else {
                        this.fade = new FadeOut(this.gevents);
                        this.state = 3;
                    }
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
                    this.fade.tick(delta);
                }
            } else if(this.state == 4){ // fade in next scene 
                if(this.fade.finished){
                    this.fade.finalize();
                    this.finished = true;
                }else{
                    this.fade.tick(delta);
                }
            }
        }
    }

    finalize() {
        this.gevents.clear_dialogs();
        if (this.gevents.mainchar != null) {
            if (this.x != null) {
                this.gevents.mainchar.arrive(this.x, this.y);
            } else {
                this.gevents.mainchar.arrive(this.gevents.mainchar.worldx, this.gevents.mainchar.worldy);
            }
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

    tick(delta) {
        if(this.alpha <= this.endalpha){
            this.alpha += this.alphadelta;

            let newgfx = new PIXI.Graphics();
            newgfx.rect(0, 0, SCREEN.instance().width, SCREEN.instance().height);
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
        this.gfx.rect(0, 0, SCREEN.instance().width, SCREEN.instance().height);
        this.gfx.fill({color: 0x000000, alpha: this.alpha});
        this.container.addChild(this.gfx);
        this.gevents.level.app.stage.addChild(this.container);
    }

    tick(delta) {
        if(this.alpha >= this.endalpha){
            this.alpha -= this.alphadelta;

            let newgfx = new PIXI.Graphics();
            newgfx.rect(0, 0, SCREEN.instance().width, SCREEN.instance().height);
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

    constructor(mainchar) {
        this.mainchar = mainchar
        if(this.mainchar != null){
            this.alisoldx = mainchar.worldx
            this.alisoldy = mainchar.worldy
            this.level = mainchar.level;
        }
        this.dqueue = [];

        this.pauseevents = false;

        this.esc = false; // has the escape key been pressed?
        this.esc_handler = null; // fired when escape key is pressed

        this.eventqueue = []; // queue of game events
        this.label_handlers  = new Map();
        this.key_handlers    = new Map();
        this.random_handlers = new Map();
        this.bg = null;
        this.input = null;

        this.last_key = null; // last key event code
    }

    // called when mainchar enters a new level
    reset(level, mainchar) {
        this.level = level; 
        this.mainchar = mainchar;
        if(mainchar != null){
            this.alisoldx = mainchar.worldx
            this.alisoldy = mainchar.worldy
            this.dqueue = [];
        }

        this.pauseevents = false;

        this.esc = false; // has the escape key been pressed?
        this.esc_handler = null; // fired when escape key is pressed

        this.eventqueue = []; // queue of game events
        this.label_handlers = new Map();
        this.key_handlers = new Map();
        this.random_handlers = new Map();

        this.bg = null;
        this.input = null;
    }

    //--
    // Return true if all dialogs are finished
    //--
    dialogs_finished(){
        return this.dqueue.length == 0 || (this.dqueue.length == 1 && this.dqueue[0].finished);
    }




    // --
    // Display a dialog on the screen. Uses a stack to manage multiple dialog requests
    // -- 
    dialog_now(text = "", place = 'bottom', callme = null, pinned = false, options = null) {
        // if an existing dialog is up and finished, clean it up
        if (this.dqueue.length > 0 && this.dqueue[0].finished) {
            this.dqueue[0].leave();
            this.dqueue.shift();
            // TODO destroy the dialog object
        }

        // if an existing dialog is up and pinned, append to that dialog
        if (this.dqueue.length > 0 && this.dqueue[0].pinned) {
            this.dqueue[0].append("\n\n"+text);
        } else if (this.dqueue.length > 0) {
            let d = new DIALOG.Dialog(this, text, pinned, place, callme, options);
            this.dqueue.push(d);
        } else {
            let d = new DIALOG.Dialog(this, text, pinned, place, callme, options);
            this.dqueue.push(d);
            d.arrive();
        }
    }

    // Stream to a dialog
    dialog_stream(text = "", place = 'bottom', options = null) {
        // if an existing dialog is up and finished, clean it up
        if (this.dqueue.length > 0 && this.dqueue[0].finished) {
            console.log("dialog_stream: dialog finished. Leaving");
            this.dqueue[0].leave();
            this.dqueue.shift();
        }

        let cb = null;
        // console.log("dialog_stream options", options);
        if(options && Object.hasOwn(options, 'appendcb')){
            cb = options.appendcb;
        }

        // if an existing dialog is up and pinned, append to that dialog
        if (this.dqueue.length > 0 && this.dqueue[0].pinned) {
            //console.log("dialog_stream cb", cb);
            // console.log("dialog_stream appending to dialog "+text);
            this.dqueue[0].append(text, cb);
        } else {
            if(options){
                options.streaming = true;
            }else{
                options = {streaming: true};
            }
            // console.log("OPTIONS ", options);
            let d = new DIALOG.Dialog(this, text, true, place, null, options);
            this.dqueue.push(d);
            d.arrive();
        }
    }

    dialog_stream_msg_end() {
        if (this.dqueue.length < 1 || !this.dqueue[0].pinned) {
            console.log("dialog_stream_done called with no active dialog. Bailing");
            return;
        }
        this.dqueue[0].stream_done();
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
    input_now(text, callme, opts){
        this.input = new INPUT.TextInput(this, text, callme, opts);
        this.input.arrive();
    }

    input_leave(){
        if (this.input) {
            this.input.leave();
            this.input = null;
        }
    }


    // -- 
    // keyboard handler for managing dialog paging etc.
    // --
    handle_event(event) {

        // Warning. This will steal event code!
        if(this.key_handlers.has(event.code)){
            let handler = this.key_handlers.get(event.code);
            this.key_handlers.delete(event.code);
            this.add_to_tick_event_queue(handler);
            return true;
        }

        this.last_key = event.code;

        if( this.dqueue.length == 0 && this.eventqueue.length == 0){
            return false; // nothing to handle
        }

        if (event.code == 'Space') {

            if (this.dqueue.length == 0){
                return;
            }
            else if (this.dqueue[0].finished) {
                if (!this.dqueue[0].pinned) {
                    this.dqueue[0].leave();
                    this.dqueue.shift();
                    if(this.dqueue.length > 0){
                        this.dqueue[0].arrive();
                    }   
                    this.last_key = null; // gobble event 
                }else{
                    // if it is pinned, let the dialog handle the event
                    this.dqueue[0].nextpage();
                }
            } else {
                this.dqueue[0].nextpage();
                this.last_key = null; // gobble event 
            }
        }
        return true;
    }

    handle_escape(){
        this.esc = true;
    }

    // -- 
    // Determine if mainchar is on a label on the map. If so return label
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
    // Register a random handler. This is used for random encounters
    // calls rand_func to determine if the handler should fire.
    // Does not clear the handler after it has fired. 
    // --
    register_random_handler(key, rand_func, handler){
        this.random_handlers.set(key, {rand_func: rand_func, handler: handler});
    }   
    delete_random_handler(key){
        this.random_handlers.delete(key);
    }   

    // --
    // To be called when mainchar steps on a label
    // --
    register_label_handler(label, handler) {
        this.label_handlers.set(label, handler);
    }
    delete_label_handler(label){
        this.label_handlers.delete(label);
    }

    // --
    // Register keyboard handler.  
    // --
    register_key_handler(key, handler){
        this.key_handlers.set(key, handler);
    }
    delete_key_handler(key){
        this.key_handlers.delete(key);
    }

    register_esc_handler(handler){
        this.esc_handler = handler;
    }

    clear_esc_handler(handler){
        this.esc_handler = null;
    }

    // --
    // Even mainchar called per tick
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

        // loop through beings and tick them
        for(let b of this.level.beings){
            b.tick(delta);
        }

        // handle dialog queue first. 
        if (this.dqueue.length > 0) {
            this.dqueue[0].tick(delta);
        } 

        if (this.eventqueue.length > 0) {
            if (!this.eventqueue[0].finished) {
                let ret = this.eventqueue[0].tick(delta);
                if(ret != null){
                    return ret; // events only return if a new level is being loaded.
                }
            } else {
                let event = this.eventqueue.shift();;
                if (this.eventqueue.length > 0) {
                    console.log(this.eventqueue[0]);
                    this.eventqueue[0].init();
                }
                event.finalize();
            }

        } else { // event queue is empty. 

            let firedhandler = false;

            if (this.mainchar != null) {
                if (this.alisoldx != this.mainchar.worldx || this.alisoldy != this.mainchar.worldy) {
                    this.alisoldx = this.mainchar.worldx;
                    this.alisoldy = this.mainchar.worldy;

                    // check current x,y to see if there is a label. And if so if we have a handler.
                    const label = this.checkLabel(this.mainchar.worldx, this.mainchar.worldy);
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

                    // Note: we only check handlers if mainchar has moved. Else the world just seems too unfair 
                    if (!firedhandler) {
                        // check random handlers
                        for (let [key, value] of this.random_handlers) {
                            let val = value.rand_func();
                            if (val) {
                                this.add_to_tick_event_queue(value.handler);
                            }
                        }
                    }   
                } // end if mainchar has moved
            } // end mainchar handler

            // run escape handler is pressed
            if(!firedhandler && this.esc){
                if(this.esc_handler){
                    this.add_to_tick_event_queue(this.esc_handler);
                    this.esc = false;
                }
            }


        } // if eventqueue
    } // Tick (main loop)

} // class GameEvents