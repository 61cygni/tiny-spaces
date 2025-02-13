import * as PIXI from 'pixi.js';

import * as LEVEL  from '@spaced/level.js';
import * as SCENE  from '@spaced/scene.js';
import * as VILLAGER  from './villager.js';
import * as BT from '@spaced/bt.js';
import * as GLOBALS from '@spaced/globals.js';
import * as SCREEN from '@spaced/screen.js';

import { sound } from '@pixi/sound';

await BT.initBT("pentacity");

const MAPFILE = import.meta.env.DEV
  ? '../games/penta/maps/penta.js'  // Dev path
  : '/maps/penta.js';  // Production path


let chatting_with_villager = null;
let shade_level = null;

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

function initOnce(level){
    let b = new BEING.Being();
}

class DialogHandler {

    constructor(gameevents){
        this.gameevents = gameevents;
        this.finished = false;

        // Use a rectangle with alpha to dim the level during dialogs
        shade_level = new PIXI.Graphics();
        shade_level.rect(0, 0, SCREEN.instance().width, SCREEN.instance().height);
        shade_level.fill({color: 0x000000, alpha: 0.5});
        shade_level.zIndex = GLOBALS.ZINDEX.DIALOG - 1;
    }

    init(){

        let v = this.gameevents.level.get_closest_being(this.gameevents.mainchar, 200);
        if(v){
            console.log("Talking to ", v.name);
            v.chatWithMainCharacter(this.gameevents.mainchar);
            chatting_with_villager = v;
            chatting_with_villager.container.zIndex = GLOBALS.ZINDEX.FOCUS;
            this.gameevents.mainchar.stop();
            this.gameevents.mainchar.face('RIGHT');
        }else{
            console.log("No one close by");
        }
    }

    tick(){
        console.log("DialogHandler tick");
        this.finished = true;
    }

    handle_bt_response(response){
        console.log("DialogHandler handle_bt_response", response);
        chatting_with_villager.addToConversationHistory(chatting_with_villager.name, response);
        this.gameevents.dialog_now(response, 'character', null, true, {character: chatting_with_villager});
    }

    handle_input(input){
        if(!chatting_with_villager){
            console.log("handle_input called after conversation ended. Bailing.");
            return;
        }
        if(input == ""){
            console.log("handle_input called with empty input. Bailing.");
            return;
        }
        chatting_with_villager.addToConversationHistory(this.gameevents.mainchar.name, input);

        BT.bt(chatting_with_villager.slug, {msg: input, history: chatting_with_villager.conversationHistoryAsText()}, this.handle_bt_response.bind(this));
    }

    finalize(){
        console.log("DialogHandler finalize");
        this.gameevents.level.container.addChild(shade_level);
        this.gameevents.input_now("", this.handle_input.bind(this), {location: 'mainchar'});
        this.gameevents.dialog_now("", 'character', null, true, {character: chatting_with_villager});
    //     console.log("DialogHandler finalize");
        this.finished = false;
        // this.gameevents.register_key_handler("Enter", this); 
    }
}

class EscapeHandler{
    constructor(gameevents){
        this.gameevents = gameevents;
        this.finished = false;
    }

    init(){
        console.log("EscapeHandler init");
        this.finished = true;
        this.gameevents.register_esc_handler(this); 
    }

    tick(){
        console.log("EscapeHandler tick");
        this.finished = true;
    }

    finalize(){
        console.log("EscapeHandler finalize");
        this.finished = false;
        this.gameevents.input_leave();
        this.gameevents.level.container.removeChild(shade_level);
        if(chatting_with_villager){
            chatting_with_villager.endChatWithMainCharacter();
            chatting_with_villager.container.zIndex = GLOBALS.ZINDEX.BEING;
            this.gameevents.level.container.sortChildren();
            chatting_with_villager = null;
        }

        this.gameevents.clear_dialogs();
        this.gameevents.register_key_handler("Enter", new DialogHandler(this.gameevents)); 
    }

}


function init(gameevents) {

    oneShotInit(gameevents);

    // Create a bunch of villagers 
    // TODO : Use an LLM to create the villagers and their names
    let v = new VILLAGER.Villager("nancy", "nancy-first-27c7", gameevents.level.spritesheet_map.get("villager2"), gameevents.level);
    gameevents.level.addBeing(v);
    v.arrive(1000, 400);

    let v2 = new VILLAGER.Villager("jane", "jane-first-a5e8", gameevents.level.spritesheet_map.get("villager3"), gameevents.level);
    gameevents.level.addBeing(v2);
    v2.arrive(800, 800);

    let v3 = new VILLAGER.Villager("bob",  "bob-first-521e", gameevents.level.spritesheet_map.get("villager4"), gameevents.level);
    gameevents.level.addBeing(v3);
    v3.arrive(400, 400);

    let v4 = new VILLAGER.Villager("bill", "bill-first-3a38", gameevents.level.spritesheet_map.get("villager5"), gameevents.level);
    gameevents.level.addBeing(v4);
    v4.arrive(400, 800);

    let v5 = new VILLAGER.Villager("alice", "alice-first-218e", gameevents.level.spritesheet_map.get("villager6"), gameevents.level);
    gameevents.level.addBeing(v5);
    v5.arrive(800, 400);

    let v6 = new VILLAGER.Villager("gordy", "gordy-first-16e8", gameevents.level.spritesheet_map.get("villager7"), gameevents.level);
    gameevents.level.addBeing(v6);
    v6.arrive(1200, 400);

    let v7 = new VILLAGER.Villager("jill", "jill-first-4720", gameevents.level.spritesheet_map.get("villager8"), gameevents.level);
    gameevents.level.addBeing(v7);
    v7.arrive(1200, 800);

    gameevents.register_esc_handler(new EscapeHandler(gameevents));
    gameevents.register_key_handler("Enter", new DialogHandler(gameevents));

    SCENE.setbgmusic('windandfire');
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
        return initOnce(this);
    }

    initonenter(ge){
        return init(ge);
    }
}

export var Instance = new Penta();