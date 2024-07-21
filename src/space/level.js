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
        this.loadFromMapFile();
        this.app.stage.addChild(this.container)

        sound.add('ps1-town', '../music/ps1-town.mp3');
        sound.loop = true;
        this.sound = sound;
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

function loadMapFromModuleFinish(mod, app, callme) {
    let level = new LevelContext(app, mod);
    callme(level);
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


function loadMapFromModule(mod, app, callme) {
    console.log(mod);
    g_ctx.tilesetpath = mod.tilesetpath;
    g_ctx.tiledimx = mod.tiledimx;
    g_ctx.tiledimy = mod.tiledimy;

    initTilesSync(loadMapFromModuleFinish.bind(null, mod, app, callme));
}

export function load(app, filename, callme) {
    // level loading
    let mod = import("../maps/ps1-camineet.js").then((mod) => {
        loadMapFromModule(mod, app, callme);
    });
}