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

// -- 
// Alice's house
// -- 
export class House2 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg      = level.static_assets.get("bg");
        this.visits  = 0;
        this.aidialog = "";

        this.dialog = "HERE IS THE HOME OF ALICE.";
    }

    btcallme(val){
        this.aidialog = val;
    }

    init (parent) {
        this.parent = parent;
        this.visits += 1;
        BT.bt("alice-home-9fee", "", this.btcallme.bind(this));
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
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
        this.gevents.level.app.stage.removeChild(this.parent.input);
        this.gevents.level.app.stage.removeChild(this.bg);
    }

}; // class House2

// -- 
// House 1 
// -- 
export class House1 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("bg");
        this.villager = level.static_assets.get("vill1");
        this.visits  = 0;

        this.firstdialog = "I'M NEKISE. ONE HEARS LOTS OF STORIES, YOU KNOW, BUT SOME SAY THAT A FIGHTER NAMED ODIN LIVES IN A TOWN CALLED SCION. ALSO, I HAVE A LACONION POT GIVEN BY NERO. THAT WOULD BE HELPFUL IN YOUR TASK.";
        this.dialog = "I WISH I COULD HELP YOU MORE. I PRAY FOR YOUR SAFETY.";
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
        if(this.visits == 1){
            this.gevents.dialog_now(this.firstdialog + this.dialog);
        }else{
            this.gevents.dialog_now(this.dialog);
        }
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class House2


export class House3 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("bg");
        this.villager = level.static_assets.get("vill2");
        this.visits  = 0;
        this.aidialog = "";

        this.firstdialog = "I'M SUELO. I KNOW HOW YOU MUST FEEL, DEAR, NO ONE CAN STOP YOU FROM DOING WHAT YOU KNOW YOU MUST DO. BUT IF YOU SHOULD EVER BE WOUNDED IN BATTLE, COME HERE TO REST."; 
        this.dialog = "PLEASE REST YOURSELF. YOU ARE WELCOME HERE ANY TIME";
    }


    // once received response from LLM
    btcallme(val){
        this.aidialog = val;
    }

    // called on first dialog response
    initdialog(val){
        this.gevents.dialog_now(val, "top", this.dialogdone.bind(this));
    }

    // after first dialog, create input
    dialogdone(){
        this.gevents.input_now("", this.inputcallme.bind(this));
    }

    // once user has entered text, call prompt
    inputcallme(val){
        console.log("CALLING "+val);
        BT.bt("camineet-house3-6471", val, this.dodialog.bind(this));
    }

    // dialog whilechatting
    dodialog(val){
        this.gevents.dialog_now(val, "top");
    }


    init() {
        this.gevents.esc = false; // clean just in case. 

        // kick off initial greating 
        BT.bt("camineet-house3-6471", "", this.initdialog.bind(this));
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        // this.gevents.dialog_now(this.aidialog, "top", this.doinput.bind(this));
        this.gevents.level.app.stage.addChild(this.bg);
        this.gevents.level.app.stage.addChild(this.villager);
    }

    // Tick called until finish
    tick() {
        if (this.gevents.esc) {
            // 
            this.gevents.esc = false;
            return false; // finished
        }
        return true;
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.input_leave();
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class House2

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