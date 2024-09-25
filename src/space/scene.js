// --
// scene.js
// Utility functions for various scene types 
//
// -- 

import * as BT  from './bt.js';
import { sound } from '@pixi/sound';

// Helper function to change music
export function setbgmusic(newsong){
    sound.stopAll();
    sound.play(newsong, {loop: true});
}

// Interactive Scene:
//
// Heads Up scene for interacting with items, Alis's AI, shops, and other locations / villagers
//
// InteractiveSceneOptions
//
// {
// bg   :   "background image",
// slug :   "intro prompt slug",
// slug2 : "conversation prompt slug",
// music : "music to play during scene",
// character : "name of character for scene,
// chat : bool, // add a chat input
// orig_dialog = "original game dialog" 
// }
//


export class InteractiveScene {

    //constructor(gevents, bg, slug, slug2 = "", character = null, chat = false) {
    constructor(gevents, options) {
        this.gevents = gevents;
        if(!Object.hasOwn(options,'bg')){
            console.log("ERR: InteractiveScene:error options needs to specify bg")
            return;
        }
        this.bg = gevents.level.static_assets.get(options.bg); 

        this.name = "";
        if(Object.hasOwn(options,'name')){
            this.name = options.name;
        }

        this.slug = "";
        if(Object.hasOwn(options,'slug')){
            this.slug = options.slug;
        }
        this.slug2 = ""; // Prompt during chat (doesn't include intro)
        if(Object.hasOwn(options,'slug2')){
            this.slug2 = options.slug2;
        }
        this.character = null;
        if(Object.hasOwn(options,'character')){
            this.character = gevents.level.static_assets.get(options.character);
        }
        this.chat = false;
        if(Object.hasOwn(options,'chat')){
            this.chat = options.chat; // whether you can chat with this character
        }

        this.orig_dialog = "";
        if(Object.hasOwn(options,'orig_dialog')){
            this.orig_dialog = options.orig_dialog; // original game dialog 
        }

        this.music = null
        if(Object.hasOwn(options,'music')){
            this.music = options.music; // original game dialog 
        }

        this.visits = 0;
        this.finished = false;

    } // constructor

    // after first dialog, create input
    dialogdone() {
    }

    async invoke_prompt_stream(){
            // BT.bt(this.slug, "", this.visits, this.firstpromptdone.bind(this));
            let result = await BT.asyncbtStream(this.slug, "", this.visits);
            let preamble = "";
            if(this.name != ""){
                preamble = this.name + ": ";
            }
            if (!this.finished) {
                this.gevents.dialog_stream(preamble, 'inputbottom', null, true);
                for await (const chunk of result) {
                    if (this.finished) {
                        break;
                    }
                    this.gevents.dialog_stream(chunk.data, 'inputbottom', null, true);
                }
            }
            // this.gevents.dialog_stream_done();
            if (!this.finished && this.chat) {
                this.gevents.input_now("", this.inputcallme.bind(this));
            }else{
              this.gevents.dialog_stream_done();
            }
    }

    // TODO consolidate with above
    async invoke_prompt_input_stream(slug, val){
            // BT.bt(this.slug, "", this.visits, this.firstpromptdone.bind(this));
            let result = await BT.asyncbtStream(slug, val, this.visits);
            let preamble = "Alis: "+val+"\n";
            if(this.name != ""){
                preamble = preamble + this.name + ": ";
            }
            if (!this.finished) {
                this.gevents.dialog_stream(preamble, 'inputbottom', null, true);
                for await (const chunk of result) {
                    if (this.finished){
                        break;
                    }
                    this.gevents.dialog_stream(chunk.data, 'inputbottom', null, true);
                }
            }

            if (this.finished ){
              this.gevents.dialog_stream_done();
            }
    }


    // once user has entered text, call prompt
    inputcallme(val){
        if(this.slug2 != ""){
            this.invoke_prompt_input_stream(this.slug2, val);
            //BT.bt(this.slug2, val, this.visits, this.dodialog.bind(this, val));
        } else {
            this.invoke_prompt_input_stream(this.slug, val);
            //BT.bt(this.slug, val, this.visits, this.dodialog.bind(this, val));
        }
    }
    // dialog whilechatting
    dodialog(user, val) {
        if (!this.finished) {
            let str = "You: "+user+"\n"+this.name+": "+val;
            this.gevents.dialog_now(str, "inputbottom", null, true);
        }
    }

    firstpromptdone(val) {
        if (!this.finished) {
            this.gevents.dialog_now(this.name +": "+val, "inputbottom", this.dialogdone.bind(this), true);
        }
        if (!this.finished && this.chat) {
            this.gevents.input_now("", this.inputcallme.bind(this));
        }
    }

    // Called each time house is entered
    init() {
        this.visits += 1;
        this.finished = false;
        this.gevents.esc = false; // clean just in case. 
        if(this.music){
            setbgmusic(this.music);
        }
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        if(this.character){
            this.gevents.level.app.stage.addChild(this.character);
        }
        if(this.slug == ""){
            this.gevents.dialog_now(this.orig_dialog);
        }
        else { 
            this.invoke_prompt_stream();
            // BT.bt(this.slug, "", this.visits, this.firstpromptdone.bind(this));
        }
    }

    // Tick called until scene is done.
    // Ret false = finished
    // Exit on ESC keypress
    tick() {
        if (this.gevents.esc) {
            // 
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        return true;
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.finished = true;
        if (this.chat) {
            this.gevents.input_leave();
        }
              this.gevents.dialog_stream_done();
        this.gevents.level.app.stage.removeChild(this.bg);
        if(this.character){
            this.gevents.level.app.stage.removeChild(this.character);
        }
        if(this.music){
            setbgmusic('ps1-town');
        }
    }

}; // class Camineet house 