import { Ticker } from '@pixi/ticker';
import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'

import * as LEVEL  from './level.js';
import * as BEING  from './being.js';
import * as GAME   from './gameevents.js';
import * as KEY    from './keyevents.js';

import * as CAM from './camineet.js';

let gameevents = null;

// Pixi init
const app = new PIXI.Application();
app.init({ width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

// Creaet Alis 
const alicespritesheet = 'spritesheets/alice2.json';
const sheet = await Assets.load(alicespritesheet);
let Alis = new BEING.Being(app, sheet, null);

// "main loop" called after level loads
// Order of loading is:
// 1. Level map (includes labels)
// 2. Alis
// 3. Game event harness
// 4. Level specific logic
function init(level) {

    let start = level.coordsdict.get("start");
    console.log("Alis start " + start[0] + " : " + start[1]);

    Alis.level = level;
    Alis.arrive(start[0] * level.tiledimx, start[1] * level.tiledimy - 14);

    // game event harness
    gameevents = new GAME.GameEvents(Alis);

    // keyboard handler
    KEY.init(gameevents, Alis);

    // Level specific logic 
    CAM.init(gameevents);

    const ticker = new Ticker();

    ticker.stop();
    ticker.add((deltaTime) => {
        Alis.tick(deltaTime);
        gameevents.tick(deltaTime);
    });

    ticker.speed = .2;
    ticker.start();
}
LEVEL.load(app, CAM.MAPFILE, CAM.static_images(), init);