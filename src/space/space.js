import { Ticker } from '@pixi/ticker';
import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'

import * as LEVEL from './level.js'


import { g_ctx }  from  '../shared/lecontext.js' // global context
import * as CONFIG from '../shared/leconfig.js' 
import * as UTIL from   '../shared/eutils.js' 

const Dir = {};

Dir[Dir[0] = 'UP']    = 1;
Dir[Dir[1] = 'DOWN']  = 2;
Dir[Dir[2] = 'LEFT']  = 4;
Dir[Dir[4] = 'RIGHT'] = 8;

let mtoggle = false;

let level = null;

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

class Being {

    constructor(app, spritesheet, level, x, y) {
        this.app = app;
        this.sheet = spritesheet;
        this.level = level;
        this.sprites = {};
        this.sprites['DOWN'] = new PIXI.AnimatedSprite(this.sheet.animations.row0);
        this.sprites['UP']   = new PIXI.AnimatedSprite(this.sheet.animations.row1);
        this.sprites['LEFT'] = new PIXI.AnimatedSprite(this.sheet.animations.row2);
        // Flip right for left
        if (!this.sheet.animations.hasOwnProperty('row3')) {
            this.sprites['RIGHT'] = new PIXI.AnimatedSprite(this.sheet.animations.row2);
            this.sprites['RIGHT'].scale.x = -1;
        }else{
            this.sprites['RIGHT'] = new PIXI.AnimatedSprite(this.sheet.animations.row3);
        }

        this.x = x; 
        this.y = y; 
        this.pausetime = Math.floor(Math.random() * 5);;
        this.pausecountdown = this.pausetime;

        this.moving = 0;
        this.direction = 'DOWN'; 
        this.curanim = this.sprites['DOWN'];
        this.curanim.animationSpeed = 0.1666;
        this.curanim.x = this.x
        this.curanim.y = this.y
        this.curanim.play();
        app.stage.addChild(this.curanim);
    }

    arrive() {
        this.curanim = this.sprites[this.direction];
        this.curanim.x = this.x
        this.curanim.y = this.y
        this.curanim.animationSpeed = 0.1666;
        this.curanim.stop();
        this.app.stage.addChild(this.curanim);
    }

    goDir(dir) {
        if(this.direction != dir){
            this.direction = dir;
            this.moving |= Dir[dir];
            this.app.stage.removeChild(this.curanim)
            this.curanim.stop()
            this.x = this.curanim.x
            this.y = this.curanim.y
            this.curanim = this.sprites[dir];
            this.curanim.animationSpeed = 0.1666;
            this.curanim.x = this.x
            this.curanim.y = this.y
            this.curanim.play();
            this.app.stage.addChild(this.curanim);
        } 

        else if(!this.curanim.playing){
            this.curanim.play();
        }


    }

    stopDir(dir) {
            this.moving &= ~Dir[dir]; // bitmask
            if(this.moving == 0){
                this.curanim.stop();
            }
    }

    timeToMove(){
        return true;

        // FIXME
        // let ret = this.pausecountdown--;
        // if(ret <= 0){
        //     this.pausecountdown = this.pausetime;
        //     return true;
        // }
        // return false;
    }

    isBlocked(x, y){
        if(!this.level){
            return;
        }
        let coordsx = Math.floor(x / 16);
        let coordsy = Math.floor(y / 16);
        let ret = this.level.objmap[0][coordsx][coordsy] != -1;
        if(ret){
            console.log("blocked "+coordsx+" : "+coordsy);
        }
        return ret;
    }

    tick(){
        if (this.moving && this.curanim.x < 624 && this.curanim.x > -1 && this.curanim.y < 448 && this.curanim.y > -1) {
            if (this.direction == 'RIGHT') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x + 16, this.curanim.y + 16)){
                    } else {
                        this.curanim.x = this.curanim.x + 1;
                    }
                }
            }
            else if (this.direction == 'LEFT') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x - 1, this.curanim.y + 16)){
                    } else {
                        this.curanim.x = this.curanim.x - 1;
                    }
                }
            }
            else if (this.direction == 'UP') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x, this.curanim.y +15)){
                    } else {
                        this.curanim.y = this.curanim.y - 1;
                    }
                }
            }
            else if (this.direction == 'DOWN') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x, this.curanim.y + 32)){
                    } else {
                        this.curanim.y = this.curanim.y + 1;
                    }
                }
            }
        }else{
            // const rdir = getRandomInt(4);
            
            // this.direction = Dir[rdir];

            // this.app.stage.removeChild(this.curanim)
            // this.curanim.stop()
            // if(this.curanim.x < 0){
            //     this.curanim.x = 0;
            // }
            // if(this.curanim.x > 623){
            //     this.curanim.x = 623;
            // }
            // if(this.curanim.y < 0){
            //     this.curanim.y = 0;
            // }
            // if(this.curanim.y > 447){
            //     this.curanim.y = 447;
            // }
            // this.x = this.curanim.x
            // this.y = this.curanim.y
            // this.curanim = this.sprites[this.direction];
            // this.curanim.x = this.x
            // this.curanim.y = this.y
            // this.curanim.animationSpeed = 0.1666;
            // this.curanim.play();
            // this.app.stage.addChild(this.curanim);
        }
    }
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
    let being = new Being(app, sheet, null, 276, 236); 
    beings.push(being);
}

function init(inlevel) {
    level = inlevel;

    for (let i = 0; i < beings.length; i++) {
        beings[i].level = level;
        beings[i].arrive();
    }

    // Add a ticker callback to move the sprite back and forth
    let elapsed = 0.0;
    const ticker = new Ticker();

    ticker.stop();
    ticker.add((deltaTime) => {
        elapsed += ticker.deltaTime;
        for (let i = 0; i < beings.length; i++) {
            beings[i].tick();
        }
    });

    ticker.speed = .2;
    ticker.start();
}

LEVEL.load(app, "../maps/ps1-camineet.js", init);