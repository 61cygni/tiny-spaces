import * as GAME   from './gameevents.js';
import * as SCENE  from './scene.js';
import * as LEVEL  from './level.js';

import { sound } from '@pixi/sound';

const MAPFILE = "../ps1/palma-anim.js";

function static_images(){
    // all static images to load;
    let static_img = [];

    static_img.push(new LEVEL.StaticImage("field-bg",      "./ps1/ps1-palma-field-bg.png",   640, 480, 0,0));

    return static_img;
}

var oneShotInit = (function() {
    var executed = false;
    return function() {
        if (!executed) {
            executed = true;

            // Sound for camineet
            sound.add('ps1-palma', './ps1/ps1-palma.mp3');
        }
    };
})();

function init(gameevents) {

    oneShotInit();
    SCENE.setbgmusic('ps1-palma');

    let alis_ai = new AlisAI(gameevents);
    
    // on exit, go to Palma overworld
    gameevents.register_label_handler("camineet", new GAME.ChangeLevel("Camineet-start2", gameevents)); 

      // on esc go to AI view
    gameevents.register_esc_handler(new GAME.StaticBackground(alis_ai, gameevents));
} // -- init

class AlisAI extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg:"field-bg", 
                name: "AI",
                slug: "alisai-44a9",
                chat: true,
                orig_dialog: "CHECK YOUR ITEMS AND SHIT"
            });
    }
};


class Palma extends LEVEL.Level {
    constructor(){
        super("Palma");
    }

    mapfile() {
        return MAPFILE;
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

export var Instance = new Palma();