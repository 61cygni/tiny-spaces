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

        if (event.code == 'KeyM'){
            mtoggle = !mtoggle;
            if(mtoggle){
                sound.play('ps1-town');
            }else{
                //sound.stop('ps1-town');
                sound.stopAll();
            }
        } 


        if(gameevents){
            if(gameevents.handle_event(event)){
                return; // handled by gameevents
            }
        }

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            Alice.goDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            Alice.goDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            Alice.goDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            Alice.goDir('LEFT');
        }

        
        // else if (event.code == 'Space'){
        //     if(dstack[0].finished){
        //         dstack[0].leave();
        //     } else {
        //         dstack[0].nextpage();
        //     }
        // }

    }
);

window.addEventListener(
    "keyup", (event) => {

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            Alice.stopDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            // DOWN
            Alice.stopDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            // Right 
            Alice.stopDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            // Left 
            Alice.stopDir('LEFT');
        }
    }
);


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const spritesheets = [
    // 'spritesheets/ps2-main0.json',
    // 'spritesheets/ps2-main1.json',
    // 'spritesheets/ps2-main2.json',
    // 'spritesheets/ps2-main3.json',
    // 'spritesheets/ps2-others0.json',
    // 'spritesheets/ps2-others1.json',
    // 'spritesheets/ps2-others2.json',
    // 'spritesheets/ps2-others3.json',
    // 'spritesheets/ps2-small0.json',   
    // 'spritesheets/ps2-small1.json',
    // 'spritesheets/ps2-small2.json',
    // 'spritesheets/ps1-others0.json',
    // 'spritesheets/ps1-others1.json',
    // 'spritesheets/ps1-others2.json',
    //'spritesheets/ys0.json',
    //'spritesheets/ys1.json',
    //'spritesheets/ff6-celes0.json',
    //'spritesheets/ff6-cyan0.json'
]

const alicespritesheet = 'spritesheets/alice2.json';
let Alice = null; 

// let beings = []

const app = new PIXI.Application();
app.init({ width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

const sheet = await Assets.load(alicespritesheet);
Alice = new BEING.Being(app, sheet, null);

function init(inlevel) {
    level = inlevel;

    Alice.level = level;

    let start = level.coordsdict.get("start");

    console.log("Alice start "+start[0]+" : "+start[1]);
    Alice.arrive(start[0] * level.tiledimx,start[1] * level.tiledimy - 14);

    gameevents = new GAME.GameEvents(Alice);

    CAM.init(gameevents);

    // Add a ticker callback to move the sprite back and forth
    let elapsed = 0.0;
    const ticker = new Ticker();

    ticker.stop();
    ticker.add((deltaTime) => {
        elapsed += ticker.deltaTime;
        Alice.tick(ticker.deltaTime);
        gameevents.tick(ticker.deltaTime);
    });


    ticker.speed = .2;
    ticker.start();
}
LEVEL.load(app, CAM.MAPFILE, CAM.static_images(), init);