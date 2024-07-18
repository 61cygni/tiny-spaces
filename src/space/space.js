import { Ticker } from '@pixi/ticker';
import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'
import { sound } from '@pixi/sound';

import { g_ctx }  from  '../shared/lecontext.js' // global context
import * as CONFIG from '../shared/leconfig.js' 
import * as UTIL from   '../shared/eutils.js' 

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
        this.pausetime = Math.floor(Math.random() * 5);;
        this.pausecountdown = this.pausetime;

        this.direction = 'DOWN'; 
        this.curanim = this.sprites['DOWN'];
        this.curanim.animationSpeed = 0.1666;
        this.curanim.x = this.x
        this.curanim.y = this.y
        this.curanim.play();
        app.stage.addChild(this.curanim);
    }

    timeToMove(){
        let ret = this.pausecountdown--;
        if(ret <= 0){
            this.pausecountdown = this.pausetime;
            return true;
        }
        return false;
    }

    tick(){
        if (this.steps && this.curanim.x < 624 && this.curanim.x > -1 && this.curanim.y < 448 && this.curanim.y > -1) {
            if (this.direction == 'RIGHT') {
                if (this.timeToMove()) {
                    this.curanim.x = this.curanim.x + 1;
                }
            }
            else if (this.direction == 'LEFT') {
                if (this.timeToMove()) {
                    this.curanim.x = this.curanim.x - 1;
                }
            }
            else if (this.direction == 'UP') {
                if (this.timeToMove()) {
                    this.curanim.y = this.curanim.y - 1;
                }
            }
            else if (this.direction == 'DOWN') {
                if (this.timeToMove()) {
                    this.curanim.y = this.curanim.y + 1;
                }
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

async function initTilesSync(callme) {

    console.log("initTileSync: "+g_ctx.tilesetpath);
    const texture = await PIXI.Assets.load(g_ctx.tilesetpath);

    if (texture.valid) {
        console.log("Texture already valid");
        callme();
        return;
    }

    console.log("Loading texture ", g_ctx.tilesetpath);
    // size of g_ctx.tileset in px
    g_ctx.tilesetpxw = texture.width;
    g_ctx.tilesetpxh = texture.height;
    console.log("Texture size w:", g_ctx.tilesetpxw, "h:", g_ctx.tilesetpxh);
    // size of g_ctx.tileset in tiles
    let tileandpad = g_ctx.tiledimx + CONFIG.tilesetpadding;
    let numtilesandpadw = Math.floor(g_ctx.tilesetpxw / tileandpad);
    g_ctx.tilesettilew = numtilesandpadw + Math.floor((g_ctx.tilesetpxw - (numtilesandpadw * tileandpad)) / g_ctx.tiledimx);
    let numtilesandpadh = Math.floor(g_ctx.tilesetpxh / tileandpad);
    g_ctx.tilesettileh = numtilesandpadh + Math.floor((g_ctx.tilesetpxh - (numtilesandpadh * tileandpad)) / g_ctx.tiledimx);
    console.log("Number of x tiles ", g_ctx.tilesettilew, " y tiles ", g_ctx.tilesettileh);

    callme();
}

class LevelContext {

    constructor(mod) {
        this.container = new PIXI.Container();
        this.tiledimx = mod.tiledimx
        this.tiledimy = mod.tiledimy
        this.screenxtiles = mod.screenxtiles
        this.screenytiles = mod.screenytiles
        this.tilesetpxw = mod.tilesetpxw;
        this.tilesetpxh = mod.tilesetpxh;
        this.bgtiles = mod.bgtiles.concat(mod.objmap)
        this.loadFromMapFile();
        app.stage.addChild(this.container)

        sound.add('my-sound', '../music/ps1-town.mp3');
        sound.loop = true;
        sound.play('my-sound');
    }

    loadFromMapFile(mod) {

        for (let i = 0; i < this.bgtiles.length; i++) {
            let tiles = this.bgtiles[i];
            console.log("Blitting tiles for layer "+i);
            for (let x = 0; x < tiles.length; x++) {
                for (let y = 0; y < tiles[0].length; y++) {
                    if (tiles[x][y] != -1) {
                        this.addTileLevelCoords(x, y, this.tiledimx, tiles[x][y]);
                    }
                }
            }
        }
    }

    addTileLevelCoords(x, y, dim, index) {
        return this.addTileLevelPx(x * dim, y * dim, index);
    }

    tileset_coords_from_index(index) {
        let x = index % (g_ctx.tilesettilew);
        let y = Math.floor(index / (g_ctx.tilesettilew));
        // console.log("tilesettilewidth: ",g_ctx.tilesettilew);
        // console.log("tileset_coords_from_index tile coords: ",index,x,y);
        return [x, y];
    }

    tileset_px_from_index(index) {
        let ret = this.tileset_coords_from_index(index);
        return [ret[0] * (g_ctx.tiledimx + CONFIG.tilesetpadding), ret[1] * (g_ctx.tiledimx + CONFIG.tilesetpadding)];
    }


    sprite_from_px(x, y) {
        const bt = PIXI.Texture.from(g_ctx.tilesetpath, {
            scaleMode: PIXI.NEAREST,
        });
        let w = g_ctx.tiledimx;
        let h = g_ctx.tiledimy;
        if(x + w > g_ctx.tilesetpxw) {
            console.log("sprite_from_px: Warning, texture overrun, truncating");
            w = g_ctx.tilesetpxw - x;
        }
        if(y + h > g_ctx.tilesetpxh) {
            console.log("sprite_from_px: Warning, texture overrun, truncating");
            y = g_ctx.tilesetpxh - h;
        }
        const crop = new PIXI.Rectangle(x, y, w, h);
        const trim = new PIXI.Rectangle(0, 0, 256, 256);
        let texture = new PIXI.Texture({source : bt,
            frame: crop,
        });
    
        let spr =  new PIXI.Sprite(texture);
        return spr;
    }

    // add tile of tileset "index" to Level at location x,y
    addTileLevelPx(x, y, index) {

        let xPx = x;
        let yPx = y;

        //TODO
        let pxloc = this.tileset_px_from_index(index);
        let ctile = this.sprite_from_px(pxloc[0], pxloc[1]);
        ctile.index = index;

         // snap to grid
         const dx = g_ctx.tiledimx;
         const dy = g_ctx.tiledimy;
 
         ctile.x  = Math.floor(xPx / dx) * dx; 
         ctile.y  = Math.floor(yPx / dy) * dy;

         this.container.addChild(ctile);
    }


}

function loadMapFromModuleFinish(mod) {

    let level = new LevelContext(mod);
    // loadAnimatedSpritesFromModule(mod);
}

function loadMapFromModule(mod) {
    console.log(mod);
    g_ctx.tilesetpath = mod.tilesetpath;
    g_ctx.tiledimx = mod.tiledimx;
    g_ctx.tiledimy = mod.tiledimy;

    initTilesSync(loadMapFromModuleFinish.bind(null, mod));
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
    'spritesheets/ps1-others0.json',
    'spritesheets/ps1-others1.json',
    'spritesheets/ps1-others2.json',
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
    let being = new Being(app, sheet, (i%6)*32, Math.floor(i/6) * 64);
    beings.push(being);
}

// level loading
let mod = import("../maps/ps1-camineet.js").then((mod) => {
    loadMapFromModule(mod);
});


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

ticker.speed = .2;
ticker.start();