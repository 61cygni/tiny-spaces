//--
// Start screen
// 
// Start screen and menu
//--

import * as LEVEL  from './level.js';
import * as GAME   from './gameevents.js';
import * as SCENE  from './scene.js';

import { sound } from '@pixi/sound';

function static_images(){
    // all static images to load;
    let static_img = [];

    static_img.push(new LEVEL.StaticImage("city-bg", "./ps1/camineet-city-bg.png",  640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("start",      "./ps1/intro-screen.png",   640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("intro1",      "./ps1/intro-one.png",     640, 1280, 0,0));
    static_img.push(new LEVEL.StaticImage("intro3",      "./ps1/intro-three.png",   640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("intro4",      "./ps1/intro-four.png",   640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("intro5",      "./ps1/intro-five.png",   640, 480, 0,0));

    return static_img;
}

var oneShotInit = (function() {
    var executed = false;
    return function() {
        if (!executed) {
            executed = true;

            // Sound for camineet
            sound.add('title', './ps1/title.mp3');
            sound.add('intro', './ps1/intro.mp3');

            sound.volumeAll = 0.05;

            sound.toggleMuteAll();
        }
    };
})();//sound.play('ps1-town', {loop: true });

function init(gameevents) {

    oneShotInit();

    SCENE.setbgmusic('title');

    let introone = new IntroOne(gameevents);
    let introtwo = new IntroTwo(gameevents);
    let introthree = new IntroThree(gameevents);
    let introfour = new IntroFour(gameevents);
    let introfive = new IntroFive(gameevents);

    let introseries = new GAME.StaticBackground(introone, gameevents, -1, -1);
    introseries.chain(new GAME.StaticBackground(introtwo, gameevents, -1, -1))
               .chain(new GAME.StaticBackground(introthree, gameevents, -1, -1))
               .chain(new GAME.StaticBackground(introfour, gameevents, -1, -1))
               .chain(new GAME.StaticBackground(introfive, gameevents, -1, -1))
               .chain(new GAME.ChangeLevel("Camineet-start1", gameevents)); 

     // on esc go to AI view
     // gameevents.register_key_handler("Enter", new GAME.ChangeLevel("Camineet-start1", gameevents)); 
     gameevents.register_key_handler("Enter", introseries); 

     // create splash series class that uses the following syntax
     // let intro_mix = new SplashSeries(....).chain(new SplashSeries(...)).chain(new SplashSeries(...)).chain(new ChangeLevel(...));

};

class IntroOne {

    constructor(gevents){
        this.gevents = gevents;
        this.bg = gevents.level.static_assets.get("intro1");
        this.state = 0; // 0 = scroll, 1 = pause, 2 = done
        this.elapsed = 0;
        this.pause_time = 20;
    }

    init(gevents){
        SCENE.setbgmusic("intro");
    }

    add_start_scene() {

        this.bg.y = -480;
        this.gevents.level.container.addChild(this.bg);
    }

    tick(delta) {

        if (this.gevents.esc || this.gevents.last_key == 'Space') {
            this.gevents.last_key = null;
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        if (this.state == 0) {
            this.bg.y -= 1;
            if (this.bg.y < -(this.bg.height - 480)) {
                this.elapsed += delta;
                this.state = 1;
            }
        }
        else if (this.state == 1) {
            // pause
            this.elapsed += delta;
            if (this.elapsed > this.pause_time) {
                this.state = 2;
            }
        } else{
            this.finished = true;
            return false;
        }
        return true;
    }

    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
    }
};

class IntroTwo {

    constructor(gevents){
        this.gevents = gevents;
        this.bg = gevents.level.static_assets.get("city-bg");
        this.elapsed = 0;
        this.pause_time = 30;
    }

    init(gevents){
        //SCENE.setbgmusic("intro");
    }

    add_start_scene() {
        this.gevents.level.container.addChild(this.bg);
        let options = {fontsize: 20};
        this.gevents.dialog_now("SPACE CENTURY 342,\nCAMINEET ON PALMA", "topleft", null, false, options);
    }

    tick(delta) {
        if (this.gevents.esc || this.gevents.last_key == 'Space') {
            this.gevents.last_key = null;
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        if (this.gevents.dialogs_finished()) {
            this.elapsed += delta;
            if (this.elapsed > this.pause_time) {
                return false;
            }
        }
        if (this.gevents.esc) {
            // 
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        return true;
    }

    remove_scene() {
        this.gevents.clear_dialogs();
        this.gevents.level.app.stage.removeChild(this.bg);
    }
};

class IntroThree {

    constructor(gevents){
        this.gevents = gevents;
        this.bg = gevents.level.static_assets.get("intro3");
        this.elapsed = 0;
        this.pause_time = 30;
    }

    init(gevents){
    }

    add_start_scene() {
        let text1 = "SCUM! DO NO SNIFF AROUND IN LASSIC'S AFFAIRS! LEARN THIS LESSON WELL !";
        let text2 = "NERO! WHAT HAPPENED! DON'T DIE!";
        this.gevents.level.container.addChild(this.bg);
        let options = {fontsize: 12};
        this.gevents.dialog_now(text1, "bottom", null, false, options);
        this.gevents.dialog_now(text2, "bottom", null, false, options);
    }

    tick(delta) {
        if (this.gevents.esc || this.gevents.last_key == 'Space') {
            this.gevents.last_key = null;
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }

        if (this.gevents.dialogs_finished()) {
            this.elapsed += delta;
            if (this.elapsed > this.pause_time) {
                return false;
            }
        }
        if (this.gevents.esc) {
            // 
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        return true;
    }

    remove_scene() {
        this.gevents.clear_dialogs();
        this.gevents.level.app.stage.removeChild(this.bg);
    }
};

class IntroFour {

    constructor(gevents){
        this.gevents = gevents;
        this.bg = gevents.level.static_assets.get("intro4");
        this.elapsed = 0;
        this.pause_time = 30;
    }

    init(gevents){
    }

    add_start_scene() {
        let text1 = "ALICE, LISTEN! LASSIC IS LEADING OUR WORLD TO DESTRUCTION. I TRIED TO DISCOVER HIS PLANS BUT I COULD NOT DO MUCH BY MYSELF. I HAD HEARD OF A MAN WITH GREAT STRENGTH NAMED \"ODIN\". MAYBE THE TWO OF YOU CAN STOP LASSIC. ALIS, IT'S TOO LATE FOR ME. BE STRONG."; 
        this.gevents.level.container.addChild(this.bg);
        let options = {fontsize: 12};
        this.gevents.dialog_now(text1, "bottom", null, false, options);
    }

    tick(delta) {
        if (this.gevents.esc  || this.gevents.last_key == 'Space') {
            this.gevents.last_key = null;
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        if (this.gevents.dialogs_finished()) {
            this.elapsed += delta;
            if (this.elapsed > this.pause_time) {
                return false;
            }
        }
        if (this.gevents.esc) {
            // 
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        return true;
    }

    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
    }
};

class IntroFive {

    constructor(gevents){
        this.gevents = gevents;
        this.bg = gevents.level.static_assets.get("intro5");
        this.elapsed = 0;
        this.pause_time = 30;
    }

    init(gevents){
    }

    add_start_scene() {
        let text1 = "I WILL MAKE SURE MY BROTHER DIED NOT IN VAIN! WATCH OVER AND PROTECT ME NERO!";
        this.gevents.level.container.addChild(this.bg);
        let options = {fontsize: 12};
        this.gevents.dialog_now(text1, "bottom", null, false, options);
    }

    tick(delta) {
        if (this.gevents.esc || this.gevents.last_key == 'Space') {
            this.gevents.last_key = null;
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        if (this.gevents.dialogs_finished()) {
            this.elapsed += delta;
            if (this.elapsed > this.pause_time) {
                return false;
            }
        }
        if (this.gevents.esc) {
            // 
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        return true;
    }

    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
    }
};

class Title extends LEVEL.Splash {
    constructor(){
        super("Title");
        this.startscreen = "start";
    }

    startscreen() {
        return "start";
    }

    static_images(){
        return static_images();
    }

    initonce(){
    }

    initonenter(ge){
        return init(ge);
    }
}

export var Instance = new Title();
