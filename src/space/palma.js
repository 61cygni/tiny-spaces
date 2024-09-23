import * as BT  from './bt.js';
import * as LEVEL  from './level.js';
import * as GAME   from './gameevents.js';

import { sound } from '@pixi/sound';

export const MAPFILE = "./ps1/palma-anim.js";

// Helper function to change music
function setbgmusic(newsong){
    sound.stopAll();
    sound.play(newsong, {loop: true});
}

export function static_images(){
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
            sound.add('ps1-palma', './ps1/ps1-palma.mp3');
        }
    };
})();
export function init(gameevents) {

    oneShotInit();
    setbgmusic('ps1-palma');
    
     // on exit, go to Palma overworld
     gameevents.register_label_handler("camineet", new GAME.ChangeLevel("camineet-start2", gameevents)); 
}