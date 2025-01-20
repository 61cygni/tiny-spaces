import { Ticker } from '@pixi/ticker';
import * as PIXI from 'pixi.js'

import * as LEVEL  from '@spaced/level.js';
import * as ALIS  from '@spaced/alis.js';
import * as GAME   from '@spaced/gameevents.js';
import * as KEY    from '@spaced/keyevents.js';

import * as TITLE from './title.js';
import * as CAM   from './camineet.js';
import * as PALMA from './palma.js';



// Pixi init
const app = new PIXI.Application();
app.init({ width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

// function get_input(target){
//     console.log(target.value);
//     target.value = "";
// }
// const input = document.getElementById('myInput');
// function register_text_input() {
// 
//     input.addEventListener('focus', () => {
//         KEY.set_text_input_focus(true);
//         console.log("FOCUS!");
//         input.parentNode.classList.add('focused');
//     });
// 
//     input.addEventListener('blur', () => {
//         console.log("NOT FOCUS!");
//         KEY.set_text_input_focus(false);
//         if (!input.value) {
//             input.parentNode.classList.remove('focused');
//         }
//     });
// 
//     KEY.register_input_handler(get_input);
// }

// Alis  (main character)
let Alis = await ALIS.getInstance(app); 

// utility functions 
function getLevelName(tag){
    return tag.split('-')[0];
}
function getLabelName(tag){
    return tag.split('-')[1];
}

// Level-Label to start the game on 
//const startlocation = "Camineet-start1";
//const startlocation = "Title-start1";
const startlocation = "Palma-start1";


//  all levels to preload
const levels = [
    TITLE.Instance,
    CAM.Instance,
    PALMA.Instance,
];

let levelmap = new Map();

function alisEnterLevel(location, gameevents) {
    let levelname = getLevelName(location);
    let labelname = getLabelName(location);

    console.log("Entering level " + levelname + ' : ' + labelname);

    let level = levelmap.get(levelname);

    if (level.details.type == "level") {
        Alis.level = level;
        gameevents.reset(level, Alis);
        level.arrive();

        let start = level.coordsdict.get(labelname);
        console.log("Alis start " + start[0] + " : " + start[1]);
        Alis.arrive(start[0] * level.tiledimx, start[1] * level.tiledimy - 14);
    }else{
        // Splash screens don't need Alis 
        gameevents.reset(level, null);
        level.arrive();
    }

    // Fade in 
    gameevents.add_to_tick_event_queue(new GAME.FadeIn(gameevents));

    // call level initialization when entering
    level.details.initonenter(gameevents);

    return level;
}

function init() {

    // game event harness
    let gameevents = new GAME.GameEvents(Alis);
    // initialize keyboard handler
    KEY.init(gameevents, Alis);
    //register_text_input();

    const ticker = new Ticker();

    // Alis enters first level
    let level = alisEnterLevel(startlocation, gameevents);

    // Main loop
    ticker.add((delta) => {
        Alis.tick(delta);
        let nextlevel = gameevents.tick(delta);
        if(nextlevel != null){

            if(Alis.hp <= 0){
                console.log("Alis is dead. Going to title screen");
                nextlevel = "Title-start1";
            }

            ticker.stop();
            console.log("Leaving "+getLevelName(nextlevel));
            Alis.leave();
            level.leave();

            level = alisEnterLevel(nextlevel, gameevents);
            ticker.start();
        }
    });

    ticker.speed = .2;
    ticker.start();
}

//  Preload all levels this requires a bunch of async calls, so kick off all of them
//    and then wait for them all to complete before running the main loop 

let promises = levels.map((leveldetails) =>{
  return LEVEL.loadSync(app, leveldetails);
}
);

Promise.all(promises).then((levels) => {
    levels.map((alevel) => {
        console.log("Loaded level: "+alevel.name);
        levelmap.set(alevel.name, alevel)
    });

    // initial entry to main loop
    init();
}
);
