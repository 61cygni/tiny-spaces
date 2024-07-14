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

const spritesheets = [
    'spritesheets/ps2-main0.json',
    'spritesheets/ps2-main1.json',
    'spritesheets/ps2-main2.json',
    'spritesheets/ps2-main3.json',
    'spritesheets/ps2-others0.json',
    'spritesheets/ps2-others1.json',
    'spritesheets/ps2-others2.json',
    'spritesheets/ps2-others3.json',
    'spritesheets/ps2-small0.json',   
    'spritesheets/ps2-small1.json',
    'spritesheets/ps2-small2.json',
    'spritesheets/ps1-others0.json',
    'spritesheets/ps1-others1.json',
    'spritesheets/ps1-others2.json',
    'spritesheets/ps1-alice0.json',
    'spritesheets/ys0.json',
    'spritesheets/ys1.json',
    'spritesheets/ff6-celes0.json'
]

let beings = []

const app = new PIXI.Application();
app.init({ width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

for(let i = 0; i < spritesheets.length; i++){
    const sheet = await Assets.load(spritesheets[i]);
    let being = new Being(app, sheet, (i%6)*32, Math.floor(i/6) * 64);
    beings.push(being);
}

// Add a ticker callback to move the sprite back and forth
let elapsed = 0.0;
const ticker = new Ticker();

ticker.stop();
ticker.add((deltaTime) => {
  elapsed += ticker.deltaTime;
  for(let i = 0; i < beings.length; i++){
    beings[i].tick();
  }
});

ticker.start();