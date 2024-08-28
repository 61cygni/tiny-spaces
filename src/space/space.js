import { Ticker } from '@pixi/ticker';
import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'

import { initLogger} from "braintrust";


import * as LEVEL  from './level.js';
import * as BEING  from './being.js';
import * as GAME   from './gameevents.js';
import * as BT    from './bt.js';


import * as CAM from './camineet.js';

let mtoggle = false;

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
                console.log("ESC");
                gameevents.esc = true;
            }
        }

        if (gameevents && gameevents.pauseevents){
            return;
        }

        if (event.code == 'KeyM'){
            mtoggle = !mtoggle;
            if(mtoggle){
                level.sound.volume = .1;
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

const sheet = await Assets.load(alicespritesheet);
Alice = new BEING.Being(app, sheet, null);

function init(inlevel) {
    level = inlevel;

    Alice.level = level;

    let start = level.coordsdict.get("start");

    console.log("Alice start "+start[0]+" : "+start[1]);
    Alice.arrive(start[0] * level.tiledimx,start[1] * level.tiledimy - 14);

    gameevents = new GAME.GameEvents(Alice);

    let house2 = new CAM.House2(gameevents, level);
    let house1 = new CAM.House1(gameevents, level);
    let house3 = new CAM.House3(gameevents, level);
    let house4 = new CAM.House4(gameevents, level);
    let house5 = new CAM.House5(gameevents, level);
    let man1   = new CAM.Man1(gameevents, level);
    let man2   = new CAM.Man2(gameevents, level);
    let man3   = new CAM.Man3(gameevents, level);
    let man4   = new CAM.Man4(gameevents, level);
    let guard1 = new CAM.Guard1(gameevents, level);

    // set up static background handlers for houses, NPCs
    gameevents.register_label_handler("house2", new GAME.StaticBackground(house2, gameevents,  31*16, (9*16)+1));
    gameevents.register_label_handler("house1", new GAME.StaticBackground(house1, gameevents,  11*16, (8*16)+1)); 
    gameevents.register_label_handler("house3", new GAME.StaticBackground(house3, gameevents,  28*16, (14*16)+1)); 
    gameevents.register_label_handler("house4", new GAME.StaticBackground(house4, gameevents,  25*16, (24*16)+1)); 
    gameevents.register_label_handler("house5", new GAME.StaticBackground(house5, gameevents,  14*16, (17*16)+1)); 
    gameevents.register_label_handler("man1",  new GAME.StaticBackground(man1,   gameevents,  (22*16), (6*16))); 
    gameevents.register_label_handler("man2",  new GAME.StaticBackground(man2,   gameevents,  (19*16)+1, (14*16))); 
    gameevents.register_label_handler("man3",  new GAME.StaticBackground(man3,   gameevents,  (12*16)+1, (19*16))); 
    gameevents.register_label_handler("man4",  new GAME.StaticBackground(man4,   gameevents,  (20*16)+1, (19*16))); 
    gameevents.register_label_handler("guard1",  new GAME.StaticBackground(guard1,   gameevents,  (9*16), (16*16))); 

    let str = "This is Camineet. Alice's hometown on planet Palma."+
               "Alice just witness the death of her brother nero."+
               "The planet is under seige by Lassic."+
               "Alice is determined to break Lassic's control"+
               "on Palma and the rest of the Algol planets."+
               "And she will exact revenge on Lassic and his"+
               "men for killing her brother.";


    const astr = BT.asyncbt("intro-blurb-a6a7", "");
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
    ticker.start();
}

LEVEL.load(app, "../maps/ps1-camineet.js", init);