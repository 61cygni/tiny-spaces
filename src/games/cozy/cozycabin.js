import * as LEVEL  from '@spaced/level.js';
import * as SCENE  from '@spaced/scene.js';

import { sound } from '@pixi/sound';

const MAPFILE = import.meta.env.DEV
  ? '../games/cozy/maps/cozycabin.js'  // Dev path
  : '/maps/cozycabin.js';  // Production path

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
            sound.add('cozy', './audio/cozy.m4a');

            sound.volumeAll = 0.05;

            // sound.toggleMuteAll();
        }
    };
})();

function init(gameevents) {

    oneShotInit();

    SCENE.setbgmusic('cozy');

} // init

class CozyCabin extends LEVEL.Level {
    constructor(){
        super("Cozy");
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

export var Instance = new CozyCabin();