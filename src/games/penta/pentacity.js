import * as LEVEL  from '@spaced/level.js';
import * as SCENE  from '@spaced/scene.js';
import * as VILLAGER  from './villager.js';

import { sound } from '@pixi/sound';

const MAPFILE = import.meta.env.DEV
  ? '../games/penta/maps/penta.js'  // Dev path
  : '/maps/penta.js';  // Production path

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

            // FIXME : This is all test code. 
            let v = new VILLAGER.Villager("nancy", gameevents.level.spritesheet_map.get("villager2"), gameevents.level);
            gameevents.level.addBeing(v);
            v.arrive(1000, 400);

            let v2 = new VILLAGER.Villager("jane", gameevents.level.spritesheet_map.get("villager3"), gameevents.level);
            gameevents.level.addBeing(v2);
            v2.arrive(800, 800);

            let v3 = new VILLAGER.Villager("bob", gameevents.level.spritesheet_map.get("villager4"), gameevents.level);
            gameevents.level.addBeing(v3);
            v3.arrive(400, 400);

            // let b2 = new BEING.Being(gameevents.level.spritesheet_map.get("villager1"), gameevents.level);
            // gameevents.level.addBeing(b2);
            // b2.arrive(400, 200);
        }
    };
})();

function initOnce(level){
    console.log("Sprite sheet map ", level.spritesheet_map);
    let b = new BEING.Being();

}


function init(gameevents) {

    oneShotInit(gameevents);

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