import { Ticker } from '@pixi/ticker';
import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'
import { Input } from '@pixi/ui';

import * as LEVEL  from './level.js'
import * as BEING  from './being.js'
import * as DIALOG from './dialog.js'


import { g_ctx }  from  '../shared/lecontext.js' // global context
import * as CONFIG from '../shared/leconfig.js' 

let mtoggle = false;

let level = null;

let dstack = [];

let input = new Input({
    bg: new PIXI.Graphics()
    .roundRect(0, 0, 64, 32, 4)
    .fill(0xffffff),
    placeholder: 'Enter text',
    padding: {
     top: 11,
     right: 11,
     bottom: 11,
     left: 11
    } // alternatively you can use [11, 11, 11, 11] or [11, 11] or just 11
});

window.addEventListener(
    "keydown", (event) => {

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            beings[0].goDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            // DOWN
            beings[0].goDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            // Right 
            beings[0].goDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            // Left 
            beings[0].goDir('LEFT');
        }
        else if (event.code == 'KeyM'){
            mtoggle = !mtoggle;
            if(mtoggle){
                level.sound.play('ps1-town');
            }else{
                level.sound.stop('ps1-town');
            }
        } else if (event.code == 'Space'){
            if(dstack[0].finished){
                dstack[0].leave();
            } else {
                dstack[0].nextpage();
            }
        }
    }
);

window.addEventListener(
    "keyup", (event) => {

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            beings[0].stopDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            // DOWN
            beings[0].stopDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            // Right 
            beings[0].stopDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            // Left 
            beings[0].stopDir('LEFT');
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
    'spritesheets/ps1-alice0.json'
    //'spritesheets/ys0.json',
    //'spritesheets/ys1.json',
    //'spritesheets/ff6-celes0.json',
    //'spritesheets/ff6-cyan0.json'
]

let beings = []

const app = new PIXI.Application();
app.init({ width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

for(let i = 0; i < spritesheets.length; i++){
    const sheet = await Assets.load(spritesheets[i]);
    // let being = new Being(app, sheet, (i%6)*32, Math.floor(i/6) * 64);
    let being = new BEING.Being(app, sheet, null, 276, 236); 
    beings.push(being);
}

function init(inlevel) {
    level = inlevel;


    for (let i = 0; i < beings.length; i++) {
        beings[i].level = level;
        beings[i].arrive();
    }

    let str = "Let's see how this works. I'm going to write"+
               "a bunch of stuff. And see how wordwraaps work."+
               "Here is one \n\n\n whopeee!"+
               "And more and more and more"+
               "And yet even more, hopefully we'll"+
               "get some pagination :) whoooo"+
               "Man this actually takes a long time to get right"+
               "Maybe my bounds check isn't working. Yikes!!!";

    let d = new DIALOG.Dialog(level, 42, 4, str);
    dstack.push(d);
    d.arrive();

    // Add a ticker callback to move the sprite back and forth
    let elapsed = 0.0;
    const ticker = new Ticker();

    ticker.stop();
    ticker.add((deltaTime) => {
        elapsed += ticker.deltaTime;
        for (let i = 0; i < beings.length; i++) {
            beings[i].tick(ticker.deltaTime);
        }
        d.tick(ticker.deltaTime);

    });


    ticker.speed = .2;
    app.stage.addChild(input);
    ticker.start();
}

LEVEL.load(app, "../maps/ps1-camineet.js", init);