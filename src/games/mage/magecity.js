import * as LEVEL  from '@spaced/level.js';
import * as GAME   from '@spaced/gameevents.js';
import * as SCENE  from '@spaced/scene.js';

// import * as ALIS  from './alis.js';

import { sound } from '@pixi/sound';

const MAPFILE = "../games/mage/maps/mage.js";

// Return static image object used by level.js to load images, size them, and create PIXI sprites from them 
function static_images(){
    // all static images to load;
    let static_img = [];

    return static_img;
}

var oneShotInit = (function() {
    var executed = false;
    return function() {
        if (!executed) {
            executed = true;

            // Sound for camineet
            sound.add('magecity', './audio/magecity.mp3');

            sound.volumeAll = 0.05;

            // sound.toggleMuteAll();
        }
    };
})();

function init(gameevents) {

    oneShotInit();

    SCENE.setbgmusic('magecity');

} // init

class Mage extends LEVEL.Level {
    constructor(){
        super("Mage");
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

export var Instance = new Mage();