
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

    static_img.push(new LEVEL.StaticImage("start",      "./ps1/intro-screen.png",   640, 480, 0,0));

    return static_img;
}

var oneShotInit = (function() {
    var executed = false;
    return function() {
        if (!executed) {
            executed = true;

            // Sound for camineet
            sound.add('title', './ps1/title.mp3');

            sound.volumeAll = 0.05;

            sound.toggleMuteAll();
        }
    };
})();//sound.play('ps1-town', {loop: true });

function init(gameevents) {

    oneShotInit();

    SCENE.setbgmusic('title');

     // on esc go to AI view
     gameevents.register_esc_handler(new GAME.ChangeLevel("Camineet-start1", gameevents)); 

};

class Title extends LEVEL.Splash {
    constructor(){
        super("Title");
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