import { Ticker } from '@pixi/ticker';
import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'

import * as LEVEL  from './level.js';
import * as BEING  from './being.js';
import * as GAME   from './gameevents.js';

import { sound } from '@pixi/sound';

import * as CAM from './camineet.js';

let mtoggle = true;

let level = null;
let gameevents = null;

let dstack = [];

// TODO : move to separate file
window.addEventListener(
    "keydown", (event) => {

        if (event.code == 'Space' || 
            event.code == 'Escape' ||
            event.code == 'ArrowUp' ||
            event.code == 'ArrowRight' ||
            event.code == 'ArrowDown' ||
            event.code == 'ArrowLeft')
         {
            event.preventDefault();
        }


        if(event.code == 'Escape'){
            if(gameevents){
                console.log("ESCAPE!");
                gameevents.esc = true;
            }
        }

        if (gameevents && gameevents.pauseevents){
            return;
        }

        if (event.code == 'KeyM') {
            sound.toggleMuteAll()
        } 


        if(gameevents){
            if(gameevents.handle_event(event)){
                return; // handled by gameevents
            }
        }

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            Alis.goDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            Alis.goDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            Alis.goDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            Alis.goDir('LEFT');
        }

    }
);

window.addEventListener(
    "keyup", (event) => {

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            Alis.stopDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            // DOWN
            Alis.stopDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            // Right 
            Alis.stopDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            // Left 
            Alis.stopDir('LEFT');
        }
    }
);

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