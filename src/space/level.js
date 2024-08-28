import * as PIXI from 'pixi.js'
import { sound } from '@pixi/sound';

import { g_ctx }  from  '../shared/lecontext.js' // global context
import * as CONFIG from '../shared/leconfig.js' 

export class LevelContext {

    constructor(app, mod) {
        this.app = app
        this.container = new PIXI.Container();
        this.tiledimx = mod.tiledimx
        this.tiledimy = mod.tiledimy
        this.screenxtiles = mod.screenxtiles
        this.screenytiles = mod.screenytiles
        this.tilesetpxw = mod.tilesetpxw;
        this.tilesetpxh = mod.tilesetpxh;
        this.bgtiles = mod.bgtiles
        this.objmap  = mod.objmap
        this.maplabels = mod.maplabels;
    }

    finalize_load(){
        this.loadFromMapFile();
        this.app.stage.addChild(this.container)

        sound.add('ps1-town', '../music/ps1-town.mp3');
        sound.loop = true;
        this.sound = sound;

       this.createLabelDic();
    }

    createLabelDic(){
        this.labeldict  = new Map()
        this.coordsdict = new Map()
        console.log("Creating label dictionary");
        for(let l = 0; l < this.maplabels.length; l++){
            console.log(this.maplabels);
            let label = this.maplabels[l];
            for(let x = label.sx; x <= label.ex; x++ ){
                for(let y = label.sy; y <= label.ey; y++){
                    console.log("Label "+x+" : "+y+" "+label.label);
                    this.labeldict.set(""+x+":"+y, label);
                    this.coordsdict.set(label.label, [x,y]);
                }

            }

        }

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
        for (let i = 0; i < this.objmap.length; i++) {
            let tiles = this.objmap[i];
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

} // class LevelContext

function loadMapFromModuleFinish(callme, level) {
    level.finalize_load();
    callme(level);
}

// TODO: move these to a separate class called "camineet" or whatever
async function loadStaticImages(level) {
    console.log("loadStaticImages: "+g_ctx.tilesetpath);

    level.static_assets = new Map();

    // TODO: move to camineet.js
    const txtbg    = await PIXI.Assets.load("./ps1/camineet-house-bg.png");
    const txtcity  = await PIXI.Assets.load("./ps1/camineet-city-bg.png");
    const txtvill1 = await PIXI.Assets.load("./ps1/villager-1.png");
    const txtvill2 = await PIXI.Assets.load("./ps1/villager-2.png");
    const txtvill3 = await PIXI.Assets.load("./ps1/villager-3.png");
    const txtvill4 = await PIXI.Assets.load("./ps1/villager-4.png");
    const txtgrd1 = await PIXI.Assets.load("./ps1/guard-1.png");

    let bg    =  new PIXI.Sprite(txtbg); 
    bg.width  = 640;
    bg.height = 480;

    let citybg    =  new PIXI.Sprite(txtcity); 
    citybg.width  = 640;
    citybg.height = 480;

    let vill1 =  new PIXI.Sprite(txtvill1); 
    vill1.width  = 80;
    vill1.height = 218;
    vill1.x = 280;
    vill1.y = 180;

    let vill2 =  new PIXI.Sprite(txtvill2); 
    vill2.width  = 80;
    vill2.height = 218;
    vill2.x = 280;
    vill2.y = 180;

    let vill3 =  new PIXI.Sprite(txtvill3); 
    vill3.width  = 80;
    vill3.height = 218;
    vill3.x = 280;
    vill3.y = 180;

    let vill4 =  new PIXI.Sprite(txtvill4); 
    vill4.width  = 80;
    vill4.height = 218;
    vill4.x = 280;
    vill4.y = 180;

    let grd1 =  new PIXI.Sprite(txtgrd1); 
    grd1.width  = 80;
    grd1.height = 218;
    grd1.x = 280;
    grd1.y = 180;

    level.static_assets.set("bg", bg);
    level.static_assets.set("city-bg", citybg);
    level.static_assets.set("vill1", vill1);
    level.static_assets.set("vill2", vill2);
    level.static_assets.set("vill3", vill3);
    level.static_assets.set("vill4", vill4);
    level.static_assets.set("guard1", grd1);

    level.label_handlers = new Map();
}

async function loadAssetsSync(app, mod, callme) {

    let level = new LevelContext(app, mod);

    await loadStaticImages(level);

    console.log("loadAssetsSync: "+g_ctx.tilesetpath);
    const texture = await PIXI.Assets.load(g_ctx.tilesetpath);

    if (texture.valid) {
        console.log("Texture already valid");
        callme(level);
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

    callme(level);
}


function loadMapFromModule(app, mod, callme) {
    console.log(mod);
    g_ctx.tilesetpath = mod.tilesetpath;
    g_ctx.tiledimx = mod.tiledimx;
    g_ctx.tiledimy = mod.tiledimy;

    loadAssetsSync(app, mod, loadMapFromModuleFinish.bind(null, callme));
}

export function load(app, filename, callme) {
    // level loading
    let mod = import(filename).then((mod) => {
        loadMapFromModule(app, mod, callme);
    });
}