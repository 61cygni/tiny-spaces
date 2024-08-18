import { Ticker } from '@pixi/ticker';
import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'
import { Input } from '@pixi/ui';

import * as LEVEL  from './level.js'
import * as BEING  from './being.js'
import * as DIALOG from './dialog.js'
import * as GAME   from './gameevents.js'


import { g_ctx }  from  '../shared/lecontext.js' // global context
import * as CONFIG from '../shared/leconfig.js' 

let mtoggle = false;

let level = null;
let gameevents = null;

let dstack = [];

// let input = new Input({
//     bg: new PIXI.Graphics()
//     .roundRect(0, 0, 64, 32, 4)
//     .fill(0xffffff),
//     placeholder: 'Enter text',
//     padding: {
//      top: 11,
//      right: 11,
//      bottom: 11,
//      left: 11
//     } // alternatively you can use [11, 11, 11, 11] or [11, 11] or just 11
// });

window.addEventListener(
    "keydown", (event) => {

        if (event.code == 'Space' || 
            event.code == 'ArrowUp' ||
            event.code == 'ArrowRight' ||
            event.code == 'ArrowDown' ||
            event.code == 'ArrowLeft')
         {
            event.preventDefault();
        }

        if (event.code == 'KeyM'){
            mtoggle = !mtoggle;
            if(mtoggle){
                level.sound.play('ps1-town');
            }else{
                level.sound.stop('ps1-town');
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

// for(let i = 0; i < spritesheets.length; i++){
//     const sheet = await Assets.load(spritesheets[i]);
//     // let being = new Being(app, sheet, (i%6)*32, Math.floor(i/6) * 64);
//     let being = new BEING.Being(app, sheet, null); 
//     beings.push(being);
// }

const sheet = await Assets.load(alicespritesheet);
Alice = new BEING.Being(app, sheet, null);

function init(inlevel) {
    level = inlevel;

    Alice.level = level;

    let start = level.coordsdict.get("start");

    console.log("Alice start "+start[0]+" : "+start[1]);
    Alice.arrive(start[0] * level.tiledimx,start[1] * level.tiledimy - 14);

    gameevents = new GAME.GameEvents(Alice);

    let bg    = level.static_assets.get("bg");
    let vill1 = level.static_assets.get("vill1");

    // set up static background handlers for houses, NPCs
    const dialog2 = "This is Alice's home.";
    gameevents.register_label_handler("house2", new GAME.StaticBackground(gameevents, "house2", bg, null, dialog2, 31*16, (9*16)+1));
    const dialog1 = "I wish I could help you more. I pray for your safety.";
    gameevents.register_label_handler("house1", new GAME.StaticBackground(gameevents, "house1", bg, vill1, dialog1, 11*16, (8*16)+1)); 

    let str = "This is Camineet. Alice's hometown on planet Palma."+
               "Alice just witness the death of her brother nero."+
               "The planet is under seige by Lassic."+
               "Alice is determined to break Lassic's control"+
               "on Palma and the rest of the Algol planets."+
               "And she will exact revenge on Lassic and his"+
               "men for killing her brother.";

    gameevents.dialog_now(str);

    // Add a ticker callback to move the sprite back and forth
    let elapsed = 0.0;
    const ticker = new Ticker();

    ticker.stop();
    ticker.add((deltaTime) => {
        elapsed += ticker.deltaTime;
        // for (let i = 0; i < beings.length; i++) {
        //     beings[i].tick(ticker.deltaTime);
        // }
        Alice.tick(ticker.deltaTime);
        gameevents.tick(ticker.deltaTime);
        // d.tick(ticker.deltaTime);
    });


    ticker.speed = .2;
    // app.stage.addChild(input);
    ticker.start();
}

LEVEL.load(app, "../maps/label.js", init);