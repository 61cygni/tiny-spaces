// -----
// To add a prompt:
//  
// https://www.braintrust.dev/app/casado/p/spaces/prompts
//
// Slugs:
// 
// Intro: intro-blurb-a6a7
// Alice House :alice-home-9fee 
// Villager 1: camineet-man-1-d027
// House 5: camineet-house-5-c9f7 
// House 3: camineet-house3-6471 
//  
// -----
import * as BT  from './bt.js';

class CamineetHouse {

    constructor(gevents, bg, slug, character = false, chat = false) {
        this.gevents = gevents;
        this.bg = gevents.level.static_assets.get(bg); // FIXME (better name)
        this.visits = 0;
        this.slug = slug; // BT prompt slug
        if(character){
            this.character = gevents.level.static_assets.get(character);
        }else{
            this.character = null;
        }
        this.chat = chat; // whether you can chat with this character

        this.finished = false;

        // original dialog from game. Should be set by child class
        this.orig_dialog = "";
    } // constructor

    // after first dialog, create input
    dialogdone() {
    }

    // once user has entered text, call prompt
    inputcallme(val){
            BT.bt(this.slug, val, this.dodialog.bind(this, val));
    }
    // dialog whilechatting
    dodialog(user, val) {
        if (!this.finished) {
            let str = "You: "+user+"\nVillager: "+val;
            this.gevents.dialog_now(str, "inputbottom", null, true);
        }
    }

    firstpromptdone(val) {
        if (!this.finished) {
            this.gevents.dialog_now(val, "inputbottom", this.dialogdone.bind(this), true);
        }
        if (!this.finished && this.chat) {
            this.gevents.input_now("", this.inputcallme.bind(this));
        }
    }

    // Called each time house is entered
    init() {
        this.finished = false;
        this.gevents.esc = false; // clean just in case. 
        this.visits += 1;
        BT.bt(this.slug, "", this.firstpromptdone.bind(this));
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        if(this.character){
            this.gevents.level.app.stage.addChild(this.character);
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
        if (this.chat) {
            this.gevents.input_leave();
        }
        this.gevents.level.app.stage.removeChild(this.bg);
        if(this.character){
            this.gevents.level.app.stage.removeChild(this.character);
        }
    }

}; // class Camineet house 

export class House1 extends CamineetHouse {
    constructor(gevents) {
        super(gevents, "bg", "camineet-house-1-0da4", "vill1");
        console.log("HOUSE! "+ this.slug);
        // original dialog from game
        this.orig_dialog = "I'M NEKISE. ONE HEARS LOTS OF STORIES, YOU KNOW, BUT SOME SAY THAT A FIGHTER NAMED ODIN LIVES IN A TOWN CALLED SCION. ALSO, I HAVE A LACONION POT GIVEN BY NERO. THAT WOULD BE HELPFUL IN YOUR TASK.";
    }
};

export class House2 extends CamineetHouse {
    constructor(gevents) {
        super(gevents, "bg", "alice-home-9fee");
        // original dialog from game
        this.orig_dialog = "HERE IS THE HOME OF ALICE.";
    }
};

export class House3 extends CamineetHouse {
    constructor(gevents) {
        super(gevents, "bg", "camineet-house3-6471", "vill2", true);
        // original dialog from game
        this.firstdialog = "I'M SUELO. I KNOW HOW YOU MUST FEEL, DEAR, NO ONE CAN STOP YOU FROM DOING WHAT YOU KNOW YOU MUST DO. BUT IF YOU SHOULD EVER BE WOUNDED IN BATTLE, COME HERE TO REST."; 
    }
};

// -- 
// House 4 
// -- 
export class House4 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("bg");
        this.villager = level.static_assets.get("vill1");
        this.visits  = 0;

        this.dialog = "YOU NEED A DUNGEON KEY TO OPEN LOCKED DOORS";
    }

    init () {
        this.visits = this.visits + 1; 
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        this.gevents.level.app.stage.addChild(this.villager);
    }

    // Tick called until finish
    tick () {
        this.gevents.dialog_now(this.dialog);
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class House4

export class House5 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("bg");
        this.villager = level.static_assets.get("vill4");
        this.visits  = 0;
        this.aidialog = "";

        this.dialog = "LEAVE ME THE FUCK ALONE";
    }

    btcallme(val){
        this.aidialog = val;
    }

    init () {
        this.visits = this.visits + 1; 
        BT.bt("camineet-house-5-c9f7", "", this.btcallme.bind(this));
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        this.gevents.level.app.stage.addChild(this.villager);
    }

    // Tick called until finish
    tick () {
        if (this.aidialog != "") {
            this.gevents.dialog_now(this.aidialog);
            //this.gevents.input_now("");
            return false; // finished
        }
        return true;
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class House5


export class Man1 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("city-bg");
        this.villager = level.static_assets.get("vill3");
        this.visits  = 0;
        this.aidialog = "";

        this.dialog = "IN SOME DUNGEONS YOU WONT GET FAR WITHOUT A LIGHT";
    }

    btcallme(val){
        this.aidialog = val;
    }

    init () {
        this.visits = this.visits + 1; 
        BT.bt("camineet-man-1-d027", "", this.btcallme.bind(this));
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        this.gevents.level.app.stage.addChild(this.villager);
    }

    // Tick called until finish
    tick () {
        if (this.aidialog != "") {
            this.gevents.dialog_now(this.aidialog);
            //this.gevents.input_now("");
            return false; // finished
        }
        return true;
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class Man1

export class Man2 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("city-bg");
        this.villager = level.static_assets.get("vill3");
        this.visits  = 0;

        this.dialog = "THERE IS A SPACEPORT TO THE WEST OF CAMINEET";
    }

    init () {
        this.visits = this.visits + 1; 
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        this.gevents.level.app.stage.addChild(this.villager);
    }

    // Tick called until finish
    tick () {
        this.gevents.dialog_now(this.dialog);
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class Man2

export class Man3 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("city-bg");
        this.villager = level.static_assets.get("vill3");
        this.visits  = 0;

        this.dialog = "IF YOU WANT TO MAKE A DEAL. YOU WANT TO HEAD TO THE PORT TOWN.";
    }

    init () {
        this.visits = this.visits + 1; 
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        this.gevents.level.app.stage.addChild(this.villager);
    }

    // Tick called until finish
    tick () {
        this.gevents.dialog_now(this.dialog);
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class Man3

export class Man4 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("city-bg");
        this.villager = level.static_assets.get("vill3");
        this.visits  = 0;

        this.dialog = "MIND YOUR OWN DAMN BUSINESS.";
    }

    init () {
        this.visits = this.visits + 1; 
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        this.gevents.level.app.stage.addChild(this.villager);
    }

    // Tick called until finish
    tick () {
        this.gevents.dialog_now(this.dialog);
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class Man4

export class Guard1 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("city-bg");
        this.villager = level.static_assets.get("guard1");
        this.visits  = 0;

        this.dialog = "YOU MAY NOT PASS.";
    }

    init () {
        this.visits = this.visits + 1; 
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        this.gevents.level.app.stage.addChild(this.villager);
    }

    // Tick called until finish
    tick () {
        this.gevents.dialog_now(this.dialog);
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class Guard1