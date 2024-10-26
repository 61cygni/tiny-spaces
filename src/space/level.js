// --
// Handles map and labels for a given level.
// Loads map from file, creates a js Map() of labels
// Also loads all static images associated with a level (e.g. static backgrounds etc.)
// --
import * as PIXI from 'pixi.js'

import { g_ctx }  from  '../shared/lecontext.js' // global context
import * as CONFIG from '../shared/leconfig.js' 

// parent class used by specific levels
export class Level {

    constructor (name) {
        this.type = "level";
        this.name = name;
    }

    // return list of static images to load
    static_images() {
        console.log("Error: Must override");
    }

    // called once during init
    initonce() {
        console.log("Error: Must override");
    }

    //called everytime entered
    initonenter() {
        console.log("Error: Must override");
    }


} // class Level

// parent class used by spash screens
export class Splash {

    constructor (name) {
        this.type = "splash";
        this.name = name;
    }

    startscreen() {
        console.log("Error: Must override");
    }

    // return list of static images to load
    static_images() {
        console.log("Error: Must override");
    }

    // called once during init
    initonce() {
        console.log("Error: Must override");
    }

    //called everytime entered
    initonenter() {
        console.log("Error: Must override");
    }

} // class Splash


export class StaticImage {

    constructor (name, filename, width, height, x, y) {
        this.name     = name;
        this.filename = filename;
        this.width    = width;
        this.height   = height;
        this.x = x;
        this.y = y;
    }

}; // class StaticImage


export class LevelContext {

    constructor(app, mod, leveldetails) {
        this.app = app;
        this.name = leveldetails.name;
        this.details = leveldetails;
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
        this.animatedsprites = mod.animatedsprites;
    }

    finalize_load(){
        this.loadFromMapFile();

        this.loadAnimatedSprites();
        this.createLabelDic();
    }

    arrive(){
        this.app.stage.addChild(this.container)
    }

    leave(){
        this.app.stage.removeChild(this.container)
    }

    createLabelDic(){
        this.labeldict  = new Map()
        this.coordsdict = new Map()
        console.log("Creating label dictionary");
        for(let l = 0; l < this.maplabels.length; l++){
            // console.log(this.maplabels);
            let label = this.maplabels[l];
            for(let x = label.sx; x <= label.ex; x++ ){
                for(let y = label.sy; y <= label.ey; y++){
                    //console.log("Label "+x+" : "+y+" "+label.label);
                    this.labeldict.set(""+x+":"+y, label);
                    this.coordsdict.set(label.label, [x,y]);
                }

            }

        }

    }

    onAnimatedLoad(m, key, sheet) {

        // setup global state so we can use layer addTileLevelMethod
        g_ctx.spritesheet = sheet;
        g_ctx.spritesheetname = key;
        let asprarray = m.get(key);
        for (let asprite of asprarray) {
            g_ctx.animrow = asprite.animation;
            this.addTileLevelPx(asprite.x, asprite.y, -1);
        }
        g_ctx.spritesheet = null;
        g_ctx.spritesheetname = null;

    }

    loadAnimatedSprites(){

        if(this.animatedsprites.length <= 0){
            return;
        }
    
        let m = new Map();
    
        for(let x = 0; x < this.animatedsprites.length; x++){
            let spr = this.animatedsprites[x];
            if(! m.has(spr.sheet)){
                m.set(spr.sheet, [spr]);
            }else{
                m.get(spr.sheet).push(spr);
            }
        }
    
        for(let key of m.keys()){
            console.log("loadAnimatedSprites: ",key);
            PIXI.Assets.load(key).then(
                this.onAnimatedLoad.bind(this, m, key)
            );
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

        let ctile = null;

        if(g_ctx.spritesheet != null){
            ctile  =  new PIXI.AnimatedSprite(g_ctx.spritesheet.animations[g_ctx.animrow]);
            ctile.animationSpeed = .05;
            ctile.autoUpdate = true;
            ctile.play();
        } else {
            //TODO
            let pxloc = this.tileset_px_from_index(index);
            ctile = this.sprite_from_px(pxloc[0], pxloc[1]);
            ctile.index = index;
        }

         // snap to grid
         const dx = g_ctx.tiledimx;
         const dy = g_ctx.tiledimy;
 
         ctile.x  = Math.floor(xPx / dx) * dx; 
         ctile.y  = Math.floor(yPx / dy) * dy;

         this.container.addChild(ctile);
    }

    destroy(){
        this.container.removeChildren();
        this.container.destroy();
    }

} // class LevelContext

export class SplashContext {

    constructor(app, splashdetails) {
        this.app = app;
        this.name    = splashdetails.name;
        this.details = splashdetails;
        this.container = new PIXI.Container();
    }

    finalize_load(){
        // TODO add static image to container
    }

    arrive(){
        this.bg = this.static_assets.get(this.details.startscreen); 
        this.container.addChild(this.bg);
        this.app.stage.addChild(this.container)
    }

    leave(){
        this.app.stage.removeChild(this.container)
    }
    
    destroy(){
        this.container.removeChildren();
        this.container.destroy();
    }

} // SplashContext


function loadMapFromModuleFinishSync(level) {
    level.finalize_load();
    return level;
}

function loadStaticImagesSync(static_images, level) {
    level.static_assets = new Map();

    let promises = [];
    for (let i = 0; i < static_images.length; i++) {
        let assetin = static_images[i];
        let p = PIXI.Assets.load(assetin.filename).then((img) => {
            const spr = new PIXI.Sprite(img);
            spr.width = assetin.width;
            spr.height = assetin.height;
            spr.x = assetin.x;
            spr.y = assetin.y;
            level.static_assets.set(assetin.name, spr);
            return spr;
        });
        promises.push(p);
    }
    return Promise.all(promises);
}

function loadAssetsSync(levelcontext) {

    let static_images = levelcontext.details.static_images();

    return loadStaticImagesSync(static_images, levelcontext).then((static_images) =>
    {
        return  PIXI.Assets.load(g_ctx.tilesetpath).then((texture) =>
        {

        if (texture.valid) {
            console.log("Texture already valid");
            return levelcontext;
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

        return levelcontext;
       });
    });
}

function loadMapFromModuleSync(app, mod, leveldetails) {

    g_ctx.spritesheet = null; // reset
    g_ctx.animatedsprites = null;

    g_ctx.tilesetpath = mod.tilesetpath;
    g_ctx.tiledimx = mod.tiledimx;
    g_ctx.tiledimy = mod.tiledimy;

    let levelcontext = new LevelContext(app, mod, leveldetails);
    return loadAssetsSync(levelcontext).then((level) => {
        return loadMapFromModuleFinishSync(level);
    });
}

function loadSplashSync(app, splashdetails) {

    let splashcontext = new SplashContext(app, splashdetails);
    let static_images = splashcontext.details.static_images();
    return loadStaticImagesSync(static_images, splashcontext).then((static_images) => {
        splashcontext.finalize_load();
        return splashcontext;
    });
}

//export function loadSync(app, name, filename, static_images) {
export function loadSync(app, leveldetails) {

    console.log("Loading level: ", leveldetails.name);

    if (leveldetails.type == "level") {
        // level loading
        return import(leveldetails.mapfile()).then((mod) => {
            return loadMapFromModuleSync(app, mod, leveldetails);
        });
    } else if (leveldetails.type == "splash") {
        return loadSplashSync(app, leveldetails);
    } else {
        console.log("Error: Unknown level type");
    }
}