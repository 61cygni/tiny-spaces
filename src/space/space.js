import { Ticker } from '@pixi/ticker';
import * as PIXI from 'pixi.js'

import * as LEVEL  from './level.js';
import * as ALIS  from './alis.js';
import * as GAME   from './gameevents.js';
import * as KEY    from './keyevents.js';

import * as CAM   from './camineet.js';
import * as PALMA from './palma.js';

// Pixi init
const app = new PIXI.Application();
app.init({ width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

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
const startlocation = "Camineet-start1";

//  all levels to preload
const levels = [
    CAM.Instance,
    PALMA.Instance,
];

let levelmap = new Map();

function alisEnterLevel(location, gameevents) {
    let levelname = getLevelName(location);
    let labelname = getLabelName(location);

    console.log("Entering level " + levelname + ' : ' + labelname);

    let level = levelmap.get(levelname);
    Alis.level = level;
    gameevents.reset(Alis);
    level.arrive();

    let start = level.coordsdict.get(labelname);
    console.log("Alis start " + start[0] + " : " + start[1]);
    Alis.arrive(start[0] * level.tiledimx, start[1] * level.tiledimy - 14);

    // Fade in 
    gameevents.add_to_tick_event_queue(new GAME.FadeIn(gameevents));

    // call level initialization when entering
    level.details.initonenter(gameevents);

    return level;
}

function init(startlevel) {

    // game event harness
    let gameevents = new GAME.GameEvents(Alis);
    // initialize keyboard handler
    KEY.init(gameevents, Alis);

    const ticker = new Ticker();

    // Alis enters first level
    let level = alisEnterLevel(startlocation, gameevents);

    // Main loop
    ticker.add((delta) => {
        Alis.tick(delta);
        let nextlevel = gameevents.tick(delta);
        if(nextlevel != null){
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
