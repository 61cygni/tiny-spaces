// --
// TODO:
// -- destroy dialog objects when they're done
// -- add item support
// DONE
// -- fix wordwrap in text canvas
// - add colors etc. to text canvas (fix)
// - add streaming support to stranger canvas
// - add keybinding to show / remove text canvas
// --

import * as PIXI from 'pixi.js';

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

// -- 

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

    dispatch_action(action){

        console.log("dispatch_action", action);

        if (action.action == "end conversation"){
            this.gameevents.dialog_stream_done();
            this.gameevents.input_leave();
            this.gameevents.level.container.removeChild(impl.shade_level);
            if(this.chatting_with_villager){
                this.chatting_with_villager.endChatWithMainCharacter();
                this.chatting_with_villager.container.zIndex = GLOBALS.ZINDEX.BEING;
                this.gameevents.level.container.sortChildren();
                this.chatting_with_villager = null;
            }
            this.gameevents.clear_dialogs();
            this.gameevents.register_key_handler("Enter", new EnterChatHandler(impl)); 
            this.is_chatting = false;
        }else if(action.action == "barter"){
            // let myitem = null; // villager's item
            // let hisitem = null; // mainchar's item
            // if(action.myitem){  
            //     myitem = action.myitem;
            // }
            // if(action.hisitem){
            //     hisitem = action.hisitem;
            // }
            // if(myitem && hisitem){
            //     this.showTradePopup(myitem, hisitem);
            //     this.gameevents.mainchar.conversationCanvas.addAction(JSON.stringify(action));
            // }
        }else{
            console.log("Unknown action: ", action);
        }
    }

    showTradePopup(myitem, hisitem) {
        const popup = new PopupDialog("Would you like to trade " + myitem + " for " + hisitem + "?", {
            width: 300,
            height: 150
        });
        
        this.gameevents.level.container.addChild(popup.show((value) => {
            if (value) {
                // User clicked Yes
                console.log("User wants to trade");
                // if(!this.gameevents.mainchar.hasItem(hisitem)){
                //     this.gameevents.mainchar.conversationCanvas.addAction(JSON.stringify(action));
                // }
                // if(!this.chatting_with_villager.hasItem(myitem)){
                //     this.chatting_with_villager.addItem(hisitem);
                // }
                // Add your trade logic here
            } else {
                // User clicked No or pressed Escape
                console.log("User declined trade");
            }
        }));
    }

}

class CheckForItemsHandler extends GAME.RawHandler {
    constructor(impl){
        super(impl.gameevents);
        this.impl = impl;
    }
    finalize(){
        this.impl.gameevents.mainchar.conversationCanvas.addItems(this.impl.gameevents.mainchar.getItemString());
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

    tick(){
        this.finished = true;
    }

    handle_bt_response(response){
        console.log("EnterChatHandler handle_bt_response", response);
        impl.chatting_with_villager.addToConversationHistory(impl.chatting_with_villager.name, response);
        if(impl.streaming){
            this.gameevents.dialog_stream(response, 'character', {character: impl.chatting_with_villager});
        }else{
            this.gameevents.dialog_now(response, 'character', null, true, {character: impl.chatting_with_villager});
        }
        this.gameevents.mainchar.conversationCanvas.addDialog(impl.chatting_with_villager.name, response);
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

        const sysinput = {
            history: impl.chatting_with_villager.conversationHistoryAsText(),
            items: impl.chatting_with_villager.getItemNames(),
            msg: input,
        };
        if (impl.streaming) {
            // force end of dialog if the user inputs something new. 
            if(this.impl.gameevents.dqueue.length > 0){
                this.impl.gameevents.dqueue[0].finished = true;
            }
            PENTA_STREAM.invoke_prompt_input_stream(this.impl, impl.chatting_with_villager.slug, sysinput)
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
            this.gameevents.dialog_stream("", 'character', {character: impl.chatting_with_villager});
        }else{
            this.gameevents.dialog_now("", 'character', null, true, {character: impl.chatting_with_villager});
        }
        this.finished = false;
    }
}

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

        this.impl.is_chatting = false;
    }
}


PentaImpl.prototype.init = function(gameevents) {

    oneShotInit(this.gameevents);

    // Create a bunch of villagers 
    let v = new VILLAGER.Villager("nancy", "nancy-first-27c7", this.gameevents.level.spritesheet_map.get("villager2"), this.gameevents.level);
    this.gameevents.level.addBeing(v);
    v.arrive(1000, 400);

    let v2 = new VILLAGER.Villager("jane", "jane-first-a5e8", this.gameevents.level.spritesheet_map.get("villager3"), this.gameevents.level);
    this.gameevents.level.addBeing(v2);
    v2.arrive(800, 800);

    let v3 = new VILLAGER.Villager("bob",  "bob-first-521e", this.gameevents.level.spritesheet_map.get("villager4"), this.gameevents.level);
    this.gameevents.level.addBeing(v3);
    v3.arrive(400, 400);

    let v4 = new VILLAGER.Villager("bill", "bill-first-3a38", this.gameevents.level.spritesheet_map.get("villager5"), this.gameevents.level);
    this.gameevents.level.addBeing(v4);
    v4.arrive(400, 800);

    let v5 = new VILLAGER.Villager("alice", "alice-first-218e", this.gameevents.level.spritesheet_map.get("villager6"), this.gameevents.level);
    v5.addItem("Medallion", "A small, old medallion.");
    v5.addItem("Bible", "A tattered, old bible.");
    this.gameevents.level.addBeing(v5);
    v5.arrive(800, 400);

    let v6 = new VILLAGER.Villager("gordy", "gordy-first-16e8", this.gameevents.level.spritesheet_map.get("villager7"), this.gameevents.level);
    this.gameevents.level.addBeing(v6);
    v6.arrive(1200, 400);

    let v7 = new VILLAGER.Villager("jill", "jill-first-4720", this.gameevents.level.spritesheet_map.get("villager8"), this.gameevents.level);
    this.gameevents.level.addBeing(v7);
    v7.arrive(1200, 800);

    this.gameevents.register_key_handler("Backquote", new ConversationCanvasToggleHandler(this));
    this.gameevents.register_key_handler("KeyI", new CheckForItemsHandler(this));
    this.gameevents.register_key_handler("Enter", new EnterChatHandler(this));
    this.gameevents.register_esc_handler(new LeaveChatHandler(this));

    SCENE.setbgmusic('windandfire');

    console.log(this.gameevents.mainchar);
    this.gameevents.level.container.addChild( this.gameevents.mainchar.conversationCanvas.container);
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