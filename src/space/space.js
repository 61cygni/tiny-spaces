import { Ticker } from '@pixi/ticker';
import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'

const Dir = {};

Dir[Dir[0] = 'UP'] = 0;
Dir[Dir[1] = 'DOWN'] = 1;
Dir[Dir[2] = 'LEFT'] = 2;
Dir[Dir[3] = 'RIGHT'] = 3;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

class Being {

    constructor(app, spritesheet, x, y) {
        this.app = app;
        this.sheet = spritesheet;
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
        this.steps = 100;

        this.direction = 'DOWN'; 
        this.curanim = this.sprites['DOWN'];
        this.curanim.animationSpeed = 0.1666;
        this.curanim.x = this.x
        this.curanim.y = this.y
        this.curanim.play();
        app.stage.addChild(this.curanim);
    }

    tick(){
        if (this.steps && this.curanim.x < 624 && this.curanim.x > -1 && this.curanim.y < 448 && this.curanim.y > -1) {
            if (this.direction == 'RIGHT') {
                this.curanim.x = this.curanim.x + 1;
            }
            else if (this.direction == 'LEFT') {
                this.curanim.x = this.curanim.x - 1;
            }
            else if (this.direction == 'UP') {
                this.curanim.y = this.curanim.y - 1;
            }
            else if (this.direction == 'DOWN') {
                this.curanim.y = this.curanim.y + 1;
            }
            this.steps -= 1;
        }else{
            const rdir = getRandomInt(4);
            
            this.direction = Dir[rdir];

            this.app.stage.removeChild(this.curanim)
            this.curanim.stop()
            if(this.curanim.x < 0){
                this.curanim.x = 0;
            }
            if(this.curanim.x > 623){
                this.curanim.x = 623;
            }
            if(this.curanim.y < 0){
                this.curanim.y = 0;
            }
            if(this.curanim.y > 447){
                this.curanim.y = 447;
            }
            this.x = this.curanim.x
            this.y = this.curanim.y
            this.curanim = this.sprites[this.direction];
            this.curanim.x = this.x
            this.curanim.y = this.y
            this.curanim.animationSpeed = 0.1666;
            this.curanim.play();
            this.app.stage.addChild(this.curanim);
            this.steps = 100;
        }
    }
}

const sheet0 = await Assets.load('sprited0.json');
const sheet1 = await Assets.load('sprited1.json');
const sheet2 = await Assets.load('sprited2.json');
const sheet3 = await Assets.load('sprited3.json');

const sheetX0 = await Assets.load('spritedX0.json');
const sheetX1 = await Assets.load('spritedX1.json');
const sheetX2 = await Assets.load('spritedX2.json');
const sheetX3 = await Assets.load('spritedX3.json');

const sheetsmall0 = await Assets.load('ps2-small0.json');
const sheetsmall1 = await Assets.load('ps2-small1.json');
const sheetsmall2 = await Assets.load('ps2-small2.json');

const sheetps10    = await Assets.load('ps1-others0.json');
const sheetps11    = await Assets.load('ps1-others1.json');
const sheetps12    = await Assets.load('ps1-others2.json');
const sheetps13    = await Assets.load('ps1-alice0.json');

const app = new PIXI.Application();

app.init({ width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

let b1 = new Being(app, sheet0, 128,150)
let b2 = new Being(app, sheet1, 156,150)
let b3 = new Being(app, sheet2, 192,150)
let b4 = new Being(app, sheet3, 228,150)

let b5 = new Being(app, sheetX0, 128,96)
let b6 = new Being(app, sheetX1, 156,96)
let b7 = new Being(app, sheetX2, 192,96)
let b8 = new Being(app, sheetX3, 228,96)

let b9  = new Being(app, sheetsmall0, 128,192)
let b10 = new Being(app, sheetsmall1, 156,192)
let b11 = new Being(app, sheetsmall2, 192,192)

let b12 = new Being(app, sheetps10, 128,224)
let b13 = new Being(app, sheetps11, 156,224)
let b14 = new Being(app, sheetps12, 192,224)
let b15 = new Being(app, sheetps13, 228,224)

// Add a ticker callback to move the sprite back and forth
let elapsed = 0.0;

const ticker = new Ticker();

ticker.stop();
ticker.add((deltaTime) => {
  elapsed += ticker.deltaTime;
  b1.tick();
  b2.tick();
  b3.tick();
  b4.tick();
  b5.tick();
  b6.tick();
  b7.tick();
  b8.tick();
  b9.tick();
  b10.tick();
  b11.tick();
  b12.tick();
  b13.tick();
  b14.tick();
  b15.tick();
});

ticker.start();