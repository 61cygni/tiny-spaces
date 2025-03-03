// --
// TODO:
// - basic testing framework where you can exercise certain parts of the system (e.g. NPC dialog)
// 
// DONE
// -- keep dialog up after conversation ends, and remove with SPACE. Use append callback in dialog to 
// -- add item support
// -- destroy dialog objects when they're done
// -- fix wordwrap in text canvas
// - add colors etc. to text canvas (fix)
// - add streaming support to stranger canvas
// - add keybinding to show / remove text canvas
// --

import * as PIXI from 'pixi.js';

import * as KEYEVENTS from '@spaced/keyevents.js';
import * as LEVEL  from '@spaced/level.js';
import * as SCENE  from '@spaced/scene.js';
import * as VILLAGER  from './villager.js';
import * as BT from '@spaced/bt.js';
import * as GLOBALS from '@spaced/globals.js';
import * as SCREEN from '@spaced/screen.js';
import * as GAME from '@spaced/gameevents.js';
import * as PENTA_STREAM from './penta_stream.js';
import { PopupDialog } from '@spaced/popup.js';

import { sound } from '@pixi/sound';

await BT.initBT("pentacity");

const MAPFILE = import.meta.env.DEV
  ? '../games/penta/maps/penta.js'  // Dev path
  : '/maps/penta.js';  // Production path

let impl = null;


// Return static image object used by level.js to load images, size them, and create PIXI sprites from them 
function static_images(){
    // all static images to load;
    let static_img = [];

    return static_img;
}

function spritesheets(){
    return [new LEVEL.Sprite("villager2", "./spritesheets/villager2.json"),
        new LEVEL.Sprite("villager3", "./spritesheets/villager3.json"),
        new LEVEL.Sprite("villager4", "./spritesheets/villager4.json"),
        new LEVEL.Sprite("villager5", "./spritesheets/villager5.json"),
        new LEVEL.Sprite("villager6", "./spritesheets/villager6.json"),
        new LEVEL.Sprite("villager7", "./spritesheets/villager7.json"),
        new LEVEL.Sprite("villager8", "./spritesheets/villager8.json"),
    ];
}

var oneShotInit = (function() {
    var executed = false;
    return function(gameevents) {
        if (!executed) {
            executed = true;

            // Sound for camineet
            sound.add('windandfire', './audio/windandfire.m4a');

            sound.volumeAll = 0.05;
        }
    };
})();

class Nancy extends VILLAGER.Villager {
    constructor(gameevents){
        super("Nancy", "nancy-first-27c7", gameevents.level.spritesheet_map.get("villager2"), gameevents.level);
    }

    add_options(options){
        options.haslocket = this.hasItem("locket");
        return options;
    }
}

class Jane extends VILLAGER.Villager {
    constructor(gameevents){
        super("Jane", "jane-first-a5e8", gameevents.level.spritesheet_map.get("villager3"), gameevents.level);
    }
}   

class Bob extends VILLAGER.Villager {
    constructor(gameevents){
        super("Bob", "bob-first-521e", gameevents.level.spritesheet_map.get("villager4"), gameevents.level);
    }
}

class Bill extends VILLAGER.Villager {
    constructor(gameevents){
        super("Bill", "bill-first-3a38", gameevents.level.spritesheet_map.get("villager5"), gameevents.level);
    }
}

class Alice extends VILLAGER.Villager {
    constructor(gameevents){
        super("Alice", "alice-first-218e", gameevents.level.spritesheet_map.get("villager6"), gameevents.level);
    }
}

class Gordy extends VILLAGER.Villager {
    constructor(gameevents){
        super("Gordy", "gordy-first-16e8", gameevents.level.spritesheet_map.get("villager7"), gameevents.level);
    }
}

class Jill extends VILLAGER.Villager {
    constructor(gameevents){
        super("Jill", "jill-first-4720", gameevents.level.spritesheet_map.get("villager8"), gameevents.level);
    }
}

class PentaImpl{
    constructor(gameevents){
        this.gameevents = gameevents;
        this.chatting_with_villager = null;
        this.streaming = true;
        this.shade_level = null;
        this.is_chatting = false;
        
        // Use a rectangle with alpha to dim the level during dialogs
        this.shade_level = new PIXI.Graphics();
        this.shade_level.rect(0, 0, SCREEN.instance().width, SCREEN.instance().height);
        this.shade_level.fill({color: 0x000000, alpha: 0.5});
        this.shade_level.zIndex = GLOBALS.ZINDEX.DIALOG - 1;
    }

    // --
    // NPCs return actions during conversations. This is the primary dispatch method to handle them.
    // --

    dispatch_action(action){
        console.log("dispatch_action", action);
        if (window.gameLog) {
            window.gameLog.debug(`Action from ${this.chatting_with_villager.name} : ${JSON.stringify(action)}`);
        }

        if (action.action == "end conversation"){
            this.gameevents.input_leave();
            this.is_chatting = false;
            if (window.gameLog) {
                window.gameLog.info("Conversation ended");
            }
            // cleanup handled by append_callback in EnterChatHandler
        }else if(action.action == "give"){
            let myitem = null; // villager's item
            if (action.myitem) {
                myitem = action.myitem;
                if (!this.chatting_with_villager.hasItem(myitem)) {
                    console.log("Error: villager does not have item: ", myitem);
                    if (window.gameLog) {
                        window.gameLog.error(`Villager ${this.chatting_with_villager.name} doesn't have item: ${myitem}`);
                    }
                    return;
                }
            }
            let str = "Villager " + this.chatting_with_villager.name + " wants to give you " + myitem;
            this.gameevents.mainchar.conversationCanvas.addAction(str);
            if (window.gameLog) {
                window.gameLog.info(`Item offer: ${this.chatting_with_villager.name} offers ${myitem}`);
            }
            this.showGivePopup(myitem);
        }else if(action.action == "barter"){
            let myitem = null; // villager's item
            let hisitem = null; // mainchar's item
            if(action.myitem){  
                myitem = action.myitem;
                if(!this.chatting_with_villager.hasItem(myitem)){
                    console.log("villager does not have item: ", myitem);
                    return;
                }
            }
            if(action.hisitem){
                hisitem = action.hisitem;
                if(!this.gameevents.mainchar.hasItem(hisitem)){
                    console.log("mainchar does not have item: ", hisitem);
                    return;
                }
            }
            if(myitem && hisitem){
                this.showTradePopup(myitem, hisitem);
                this.gameevents.mainchar.conversationCanvas.addAction(JSON.stringify(action));
            }
        }else{
            console.log("Unknown action: ", action);
        }
    }

    showTradePopup(myitem, hisitem) {
        const popup = new PopupDialog("Would you like to trade " + myitem + " for " + hisitem + "?", {
            width: 300,
            height: 150
        });
        
        if (window.gameLog) {
            window.gameLog.info(`Trade proposed: ${myitem} for ${hisitem}`);
        }
        
        this.gameevents.mainchar.container.addChild(popup.show((value) => {
            if (value) {
                // User clicked Yes
                console.log("User wants to trade");
                this.gameevents.mainchar.removeItem(hisitem);
                this.chatting_with_villager.addItem(hisitem);
                this.chatting_with_villager.removeItem(myitem);
                this.gameevents.mainchar.addItem(myitem);
                let str = "you traded " + hisitem + " for " + myitem + " with " + this.chatting_with_villager.name;
                
                this.gameevents.mainchar.conversationCanvas.addAction(str);
                if (window.gameLog) {
                    window.gameLog.info(`Trade completed: ${hisitem} for ${myitem}`);
                }
            } else {
                // User clicked No or pressed Escape
                console.log("User declined trade");
                if (window.gameLog) {
                    window.gameLog.info("Trade declined");
                }
            }
        }));
        this.gameevents.mainchar.container.sortChildren();
    }

    showGivePopup(myitem) {
        const popup = new PopupDialog("Would you like to take " + myitem + "?", {
            width: 300,
            height: 150
        });
        
        this.gameevents.mainchar.container.addChild(popup.show((value) => {
            if (value) {
                // User clicked Yes
                console.log("User wants to give");
                this.chatting_with_villager.removeItem(myitem);
                this.gameevents.mainchar.addItem(myitem);
                let str = "you got " + myitem + " from " + this.chatting_with_villager.name;
                this.gameevents.mainchar.conversationCanvas.addAction(str);
            } else {
                let str = "you declined to take " + myitem + " from " + this.chatting_with_villager.name;
                this.gameevents.mainchar.conversationCanvas.addAction(str);
                // User clicked No or pressed Escape
                console.log("User declined to take item");
            }
        }));
        this.gameevents.mainchar.container.sortChildren();
    }



}

class CheckForItemsHandler extends GAME.RawHandler {
    constructor(impl){
        super(impl.gameevents);
        this.impl = impl;
    }
    finalize(){
        if (!KEYEVENTS.get_input_visible()) {
            this.impl.gameevents.mainchar.conversationCanvas.addItems(this.impl.gameevents.mainchar.getItemString());
        }
        this.impl.gameevents.register_key_handler("KeyI", new CheckForItemsHandler(this.impl));
    }
}

class ConversationCanvasToggleHandler extends GAME.RawHandler {
    constructor(impl){
        super(impl.gameevents);
        this.impl = impl;
    }

    finalize(){
        this.impl.gameevents.mainchar.conversationCanvas.toggle();
        this.impl.gameevents.register_key_handler("Backquote", new ConversationCanvasToggleHandler(this.impl));
    }
}

// --
// Start a conversation with the closest villager
// --
class EnterChatHandler {

    constructor(impl){
        this.impl = impl;
        this.gameevents = impl.gameevents;
        this.finished = false;
    }

    init(){

        let v = this.gameevents.level.get_closest_being(this.gameevents.mainchar, 200);
        if(v){
            console.log("Talking to ", v.name);
            v.chatWithMainCharacter(this.gameevents.mainchar);
            impl.chatting_with_villager = v;
            impl.chatting_with_villager.container.zIndex = GLOBALS.ZINDEX.FOCUS;
            this.gameevents.mainchar.stop();
            this.gameevents.mainchar.face('RIGHT');
            this.impl.is_chatting = true;
        }else{
            console.log("No one close by");
        }
    }

    tick(){ // go directly to finalize
        this.finished = true;
    }

    append_callback() {
        if (!this.impl.is_chatting) {
            this.gameevents.dialog_stream_done();
            this.gameevents.level.container.removeChild(impl.shade_level);
            if (this.chatting_with_villager) {
                this.chatting_with_villager.endChatWithMainCharacter();
                this.chatting_with_villager.container.zIndex = GLOBALS.ZINDEX.BEING;
                this.gameevents.level.container.sortChildren();
                this.chatting_with_villager = null;
            }
            this.gameevents.clear_dialogs();
            this.gameevents.register_key_handler("Enter", new EnterChatHandler(impl));
        }
    }


    handle_bt_response(response){
        if(impl.streaming){
            console.log("Error: handle_bt_response called while streaming");
            return;
        }
        // console.log("EnterChatHandler handle_bt_response", response);
        // impl.chatting_with_villager.addToConversationHistory(impl.chatting_with_villager.name, response);
        // if(impl.streaming){
        //     this.gameevents.dialog_stream(response, 'character', {character: impl.chatting_with_villager, appendcb: this.append_callback.bind(this), fontsize: 14, width: 256*2, height: 96*2});
        // }else{
            this.gameevents.dialog_now(response, 'character', null, true, {character: impl.chatting_with_villager});
        // }
        this.gameevents.mainchar.conversationCanvas.addDialog(impl.chatting_with_villager.name, response);
    }

    send_to_dialog(msg) {
        this.gameevents.dialog_stream(msg, 'character', 
            { character: impl.chatting_with_villager, appendcb: this.append_callback.bind(this), 
                fontsize: 14, width: 256 * 1.5, height: 96 * 1.5 });
    }

    log_response(villager_name, msg) {
        this.impl.gameevents.mainchar.conversationCanvas.addDialog(villager_name, msg);
        // Log the villager's response to the event log using npcinfo
        if (window.gameLog) {
            window.gameLog.npcinfo(villager_name, msg);
        }
    }

    handle_input(input){
        input = input.trim();
        if(!impl.chatting_with_villager){
            console.log("handle_input called after conversation ended. Bailing.");
            return;
        }
        if(input == ""){
            console.log("handle_input called with empty input. Bailing.");
            return;
        }
        this.gameevents.mainchar.conversationCanvas.addDialog(this.gameevents.mainchar.name, input);
        impl.chatting_with_villager.addToConversationHistory(this.gameevents.mainchar.name, input);
        
        // Log the player's input to the event log
        if (window.gameLog) {
            window.gameLog.maininfo(this.gameevents.mainchar.name, input);
        }

        const sysinput = {
            history: impl.chatting_with_villager.conversationHistoryAsText(),
            items: impl.chatting_with_villager.getItemNames(),
            strangeritems: impl.gameevents.mainchar.getItemNames(),
            msg: input,
        };
        if (impl.streaming) {
            // force end of dialog if the user inputs something new. 
            if(this.impl.gameevents.dqueue.length > 0){
                this.impl.gameevents.dqueue[0].finished = true;
            }
            impl.chatting_with_villager.add_options(sysinput);
            PENTA_STREAM.invoke_prompt_input_stream(this.impl, impl.chatting_with_villager.slug, sysinput, this.send_to_dialog.bind(this), this.log_response.bind(this, this.impl.chatting_with_villager.name))
        } else {
            BT.bt(impl.chatting_with_villager.slug, sysinput, this.handle_bt_response.bind(this));
        }
        
    }

    finalize(){
        console.log("EnterChatHandler finalize");
        this.gameevents.level.container.addChild(impl.shade_level);
        // this.gameevents.level.container.addChild(this.gameevents.mainchar.conversationCanvas.container);
        this.gameevents.input_now("", this.handle_input.bind(this), {location: 'mainchar'});
        if(impl.streaming){
            this.gameevents.dialog_stream("", 'character', {character: impl.chatting_with_villager, appendcb: this.append_callback.bind(this), fontsize: 14, width: 256*1.5, height: 96*1.5});
        }else{
            this.gameevents.dialog_now("", 'character', null, true, {character: impl.chatting_with_villager});
        }
        this.finished = false;
    }
} // Class EnterChatHandler

class LeaveChatHandler{
    constructor(impl){
        this.impl = impl;
        this.gameevents = impl.gameevents;
        this.finished = false;
    }

    init(){
        console.log("LeaveChatHandler init");
        this.finished = true;
        this.gameevents.register_esc_handler(this); 
    }

    tick(){
        console.log("LeaveChatHandler tick");
        this.finished = true;
    }

    finalize(){
        console.log("LeaveChatHandler finalize");
        this.finished = false;
        this.gameevents.input_leave();
        this.gameevents.level.container.removeChild(impl.shade_level);
        if(impl.chatting_with_villager){
            impl.chatting_with_villager.endChatWithMainCharacter();
            impl.chatting_with_villager.container.zIndex = GLOBALS.ZINDEX.BEING;
            this.gameevents.level.container.sortChildren();
            impl.chatting_with_villager = null;
        }

        this.gameevents.clear_dialogs();
        this.gameevents.register_key_handler("Enter", new EnterChatHandler(impl)); 

        this.impl.gameevents.pauseevents = false;
        this.impl.is_chatting = false;
    }
}


PentaImpl.prototype.init = function(gameevents) {

    oneShotInit(this.gameevents);

    // Create a bunch of villagers 
    // let v = new VILLAGER.Villager("nancy", "nancy-first-27c7", this.gameevents.level.spritesheet_map.get("villager2"), this.gameevents.level);
    let nancy = new Nancy(this.gameevents);
    nancy.addItem("Black mask", "A black mask with a red eye.");
    this.gameevents.level.addBeing(nancy);
    nancy.arrive(1000, 400);

    let jane = new Jane(this.gameevents);
    jane.addItem("locket", "A locket with a picture of a young woman.");
    this.gameevents.level.addBeing(jane);
    jane.arrive(800, 800);

    let bob = new Bob(this.gameevents);
    bob.addItem("black book", "An unadorned, black book.");
    this.gameevents.level.addBeing(bob);
    bob.arrive(400, 400);

    let bill = new Bill(this.gameevents);
    bill.addItem("rock", "A smooth, round rock.");
    this.gameevents.level.addBeing(bill);
    bill.arrive(400, 800);

    let alice = new Alice(this.gameevents);
    alice.addItem("Medallion", "A small, old medallion.");
    alice.addItem("Bible", "A tattered, old bible.");
    this.gameevents.level.addBeing(alice);
    alice.arrive(800, 400);

    let gordy = new Gordy(this.gameevents);
    gordy.addItem("Gold medal", "For winners");
    gordy.addItem("Silver medal", "For almost winners");
    gordy.addItem("Cupie doll", "For everyone");
    this.gameevents.level.addBeing(gordy);
    gordy.arrive(1200, 400);

    let jill = new Jill(this.gameevents);
    jill.addItem("key", "A small, old key.");
    this.gameevents.level.addBeing(jill);
    jill.arrive(1200, 800);

    this.gameevents.register_key_handler("Backquote", new ConversationCanvasToggleHandler(this));
    this.gameevents.register_key_handler("KeyI", new CheckForItemsHandler(this));
    this.gameevents.register_key_handler("Enter", new EnterChatHandler(this));
    this.gameevents.register_esc_handler(new LeaveChatHandler(this));

    SCENE.setbgmusic('windandfire');

    console.log(this.gameevents.mainchar);
    this.gameevents.level.container.addChild( this.gameevents.mainchar.conversationCanvas.container);
    if (window.gameLog) {
        window.gameLog.info("Game initialization complete");
    }
} // init


class Penta extends LEVEL.Level {
    constructor(){
        super("Penta");
    }

    mapfile() {
        return MAPFILE;
    }

    static_images(){
        return static_images();
    }

    spritesheets(){
        return spritesheets();
    }

    initonce(){
    }

    initonenter(ge){
        impl = new PentaImpl(ge);
        return impl.init(ge);
    }
}

export var Instance = new Penta();