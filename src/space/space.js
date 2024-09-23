import { Ticker } from '@pixi/ticker';
import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'

import * as LEVEL  from './level.js';
import * as ALIS  from './alis.js';
import * as GAME   from './gameevents.js';
import * as KEY    from './keyevents.js';

import * as CAM   from './camineet.js';
import * as PALMA from './palma.js';

let gameevents = null;

// Pixi init
const app = new PIXI.Application();
app.init({ width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

// Alis  (main character)
const alicespritesheet = 'spritesheets/alice2.json';
const sheet = await Assets.load(alicespritesheet);
let Alis = new ALIS.Alis(app, sheet, null);

// 
// Initialization and main loop
// 
// Order of loading is:
// 1. Level map (includes labels)
// 2. Alis
// 3. Game event harness
// 4. Level specific logic

// This is a total hack while writing code FIXME!!
let levelname = "camineet";
let startname = "start1";
function init(level) {

    let start = level.coordsdict.get(startname);
    console.log("Alis start " + start[0] + " : " + start[1]);

    Alis.level = level;
    Alis.arrive(start[0] * level.tiledimx, start[1] * level.tiledimy - 14);

    // game event harness
    gameevents = new GAME.GameEvents(Alis);
    KEY.init(gameevents, Alis);

    // Fade in current level
    gameevents.add_to_tick_event_queue(new GAME.FadeIn(gameevents));

    if(levelname == "camineet"){
        CAM.init(gameevents);
    }else if (levelname == "palma"){
        PALMA.init(gameevents);
    }else{
        console.log("Error, unknown level name");
    }

    const ticker = new Ticker();

    // Main loop
    let nextlevel = null;
    ticker.add((deltaTime) => {
        Alis.tick(deltaTime);
        nextlevel = gameevents.tick(deltaTime);
        if(nextlevel != null){
            if (nextlevel.startsWith("palma")) {
                ticker.stop();
                console.log("Destroying level: "+level.name);
                Alis.leave();
                level.destroy();
                levelname = "palma";
                startname = nextlevel.split('-')[1]; 
                console.log("Loading next level " + levelname + ' : '+ startname);
                LEVEL.load(app, "Palma", PALMA.MAPFILE, PALMA.static_images(), init);
                ticker.destroy();
            }else if (nextlevel.startsWith("camineet")){
                ticker.stop();
                console.log("Destroying level: "+level.name);
                Alis.leave();
                level.destroy();
                levelname = "camineet";
                startname = nextlevel.split('-')[1]; 
                console.log("Loading next level " + levelname + ' : '+ startname);
                LEVEL.load(app, "Camineet", CAM.MAPFILE, CAM.static_images(), init);
                ticker.destroy();
            }else{
                console.log("Error: Unknown level " + nextlevel);
            }
        }
    });

    ticker.speed = .2;
    console.log("Ticker speed: "+ticker.speed);
    ticker.start();
}
LEVEL.load(app, "Camineet", CAM.MAPFILE, CAM.static_images(), init);