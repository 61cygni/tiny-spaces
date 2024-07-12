// --
// Tool for creating sprites out of old sprite sheets 
//
// TODO: 
//   - (!!) Calculate level tile heights and widths when leveldimx/leveldimy change 
// 
// Keybindings:
// <ctl>-z - undo
// d - hold while clicking a tile to delete
// 
// --

import * as PIXI from 'pixi.js'
import { g_ctx }  from './secontext.js' // global context
import * as CONFIG from './seconfig.js' 
import * as UNDO from './undo.js'
import * as SPRITEFILE from './spritefile.js'
import * as UI from './sehtmlui.js'

g_ctx.debug_flag = true;

// --
// Set of utility functions to map tileset and level pixels to coordinates, indexes and
// back again.
// --
function tileset_index_from_coords(x, y) {
    let retme = x + (y*g_ctx.tilesettilew);
    if (g_ctx.debug_flag) {
        console.log("tileset_index_from_coord ", retme, x, y);
    }
    return retme; 
}
function level_index_from_coords(x, y) {
    let retme = x + (y*CONFIG.leveltilewidth);
    return retme;
}
function tileset_index_from_px(x, y) {
    let coord_x = Math.floor((x - g_ctx.tileset.fudgex) / (g_ctx.tiledimx + g_ctx.tilepadding));
    let coord_y = Math.floor((y - g_ctx.tileset.fudgey) / (g_ctx.tiledimy+ g_ctx.tilepadding));
    if (g_ctx.debug_flag) {
        console.log("tileset_index_from_px ", x, y);
    }
    return tileset_index_from_coords(coord_x, coord_y); 
}
function level_index_from_px(x, y) {
    let coord_x = Math.floor(x / g_ctx.tiledimx);
    let coord_y = Math.floor(y / g_ctx.tiledimy);
    return level_index_from_coords(coord_x, coord_y); 
}
function tileset_coords_from_index(index) {
    let x = index % (g_ctx.tilesettilew);
    let y = Math.floor(index / (g_ctx.tilesettilew));
    if (g_ctx.debug_flag) {
        console.log("tilesettilewidth: ", g_ctx.tilesettilew);
        console.log("tileset_coords_from_index tile coords: ", index, x, y);
    }
    return [x, y];
}
function tileset_px_from_index(index) {
        let ret = tileset_coords_from_index(index); 
        return [ret[0] * (g_ctx.tiledimx+g_ctx.tilepadding), ret[1] * (g_ctx.tiledimy+g_ctx.tilepadding)] ;
}


// --
// From the loaded tileset, return a sprite starting at locations (x,y)
// and of size tiledimx, tiledimy
// -- 
function sprite_from_px(x, y) {

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
    return new PIXI.Sprite(texture);
}

// struct to store positions when using a mouse to click and drag a rectangle 
function DragState() {
    this.square  = new PIXI.Graphics();
    this.tooltip = new PIXI.Text({
        text: '',
        fontFamily: 'Courier',
        fontSize: 12,
        fill: 0xffffff,
        align: 'center',
    });
    this.startx  = 0;
    this.starty = 0;
    this.endx   = 0;
    this.endy   = 0;
}

class LayerContext {

    constructor(app, pane, num, mod = null) {
        this.app = app;
        this.scrollpane = pane;
        this.num = num;
        this.widthpx  = CONFIG.levelwidth;
        this.heightpx = CONFIG.levelheight;


        this.container = new PIXI.Container();
        this.sprites = {};
        this.composite_sprites = {};
        this.dragctx = new DragState();
        this.tilearray = Array.from(Array(CONFIG.leveltileheight), () => new Array().fill(null)); 

        app.stage.addChild(this.container);

        this.mouseshadow    = new PIXI.Container();
        this.mouseshadow.zIndex = CONFIG.zIndexMouseShadow; 
        this.lasttileindex  = -1; 

        this.fudgex = 0; // offset from 0,0
        this.fudgey = 0;

        this.square = new PIXI.Graphics();
        this.square.rect(0, 0, CONFIG.levelwidth, CONFIG.levelheight);
        this.square.fill(0x2980b9);
        this.square.eventMode = 'static';
        this.container.addChild(this.square);

        this.square.on('mousemove', onLevelMousemove.bind(this));
        this.square.on('mouseover', onLevelMouseover.bind(this));
        this.square.on('pointerout', onLevelMouseOut.bind(this))
        this.square.on('pointerdown', onLevelPointerDown.bind(null, this))
            .on('pointerup', onLevelDragEnd.bind(null, this))
            .on('pointerupoutside', onLevelDragEnd.bind(null, this));

        if (mod != null && !(mod === g_ctx)) {
            this.loadFromMapFile(mod);
        }
    }

    // add tile of "index" to Level at location x,y
    addTileLevelCoords(x, y, dim, index) {
        return this.addTileLevelPx(x * dim, y * dim, index);
    }

    // -- delete all sprites / textures on a given index
    // will NOOP if no tile exists
    deleteFromIndex(index) {
        if(g_ctx.debug_flag){
            console.log("deleteFromIndex ",index)
        }
        
        if(this.sprites.hasOwnProperty(index)){
            let ctile = this.sprites[index];
            let row = Math.floor(ctile.y / g_ctx.tiledimy);
            let col = Math.floor(ctile.x / g_ctx.tiledimx);
            for(let x = 0; x < this.tilearray[row].length; x++){
                if(this.tilearray[row][x].x == col * g_ctx.tiledimx){
                    console.log("Removing texture from tilearray ",x,row);
                    this.tilearray[row].splice(x, 1);
                }
            }

            this.container.removeChild(this.sprites[index]);
            delete this.sprites[index];
            this.updateAnimatedTiles();
        }

    }

    // add tile of "index" to Level at location x,y
    addTileLevelPx(x, y, index) {
        let xPx = x;
        let yPx = y;

        let ctile = null;
        let ctile2 = null;

        let pxloc = tileset_px_from_index(index);
        ctile = sprite_from_px(pxloc[0] + g_ctx.tileset.fudgex, pxloc[1] + g_ctx.tileset.fudgey);
        ctile.index = index;

        // snap to grid
        const dx = g_ctx.leveldimx;
        const dy = g_ctx.leveldimy;
        ctile.x = Math.floor(xPx / dx) * dx;
        ctile.y = Math.floor(yPx / dy) * dy;
        // Stuff tileset coords into ctile for writing to ts file
        ctile.tspx = [pxloc[0] + g_ctx.tileset.fudgex, pxloc[1] + g_ctx.tileset.fudgey]; 

        let new_index = level_index_from_px(ctile.x, ctile.y);

        if (g_ctx.debug_flag) {
            console.log('addTileLevelPx ', this.num, ' ctile.x ', ctile.x, 'ctile.y ', ctile.y, "index ", index, "new_index", new_index);
        }

        if (!g_ctx.dkey) {
            this.container.addChild(ctile);
        }

        if (this.sprites.hasOwnProperty(new_index)) {
            this.deleteFromIndex(new_index);
        }

        if (!g_ctx.dkey) {
            this.tilearray[Math.floor(yPx / dy)].push(ctile);
            this.sprites[new_index] = ctile;
        } else if (typeof this.filtergraphics != 'undefined') {
            this.filtergraphics.clear();
            this.drawFilter();
                this.drawFilter(); // do twice to get toggle back to original state
        }

        return new_index;
    }

    // --
    // FIXME : currently just a naive loop. 
    // --
    updateAnimatedTiles() {
        console.log("updateAnimatedTiles");
        for (let row = 0; row < CONFIG.leveltileheight; row++) {
            if (!this.tilearray[row][0]) {
                continue;
            }
            let textures = [];
            for (let x = 0; x < this.tilearray[row].length; x++) {
                textures.push(this.tilearray[row][x].texture);
            }
            const as = new PIXI.AnimatedSprite(textures);
            as.x = row * g_ctx.leveldimx;
            as.y = this.num * g_ctx.leveldimy;
            as.animationSpeed = .1;
            as.autoUpdate = true;
            as.play();
            if (this.tilearray[row].hasOwnProperty('as')){
                g_ctx.composite.container.removeChild(this.tilearray[row].as);
            }
            this.tilearray[row].as = as;
            g_ctx.composite.container.addChild(as);
        }
    }
} // class  LayerContext

// --
// Image for newly generated spritesheet
// --
class SpritesheetContext {

    constructor(app, mod = g_ctx) {
        this.app = app;
        this.container = new PIXI.Container();
        app.stage.addChild(this.container);
    }

} // class SpritesheetContext

class TilesetContext {

    constructor(app, mod = g_ctx) {
        this.app = app;
        this.container = new PIXI.Container();


        console.log(mod.tilesetpath);
        const texture = PIXI.Texture.from(mod.tilesetpath);
        const bg    = new PIXI.Sprite(texture);

        this.widthpx  = g_ctx.tilesetpxw;
        this.heightpx = g_ctx.tilesetpxh;

        this.square = new PIXI.Graphics();
        this.square.rect(0, 0, mod.tilesetpxw, mod.tilesetpxh);
        this.square.fill(0x2980b9);
        this.square.eventMode = 'static';
        this.container.addChild(this.square);
        this.container.addChild(bg);
        
        this.app.stage.addChild(this.container);

        this.fudgex = 0; // offset from 0,0
        this.fudgey = 0;

        this.dragctx = new DragState();

        this.square.on('mousedown', function (e) {
            if(g_ctx.debug_flag) {
                console.log("g_ctx.tileset mouse down. index "+g_ctx.tile_index);
            }

            g_ctx.tile_index = tileset_index_from_px(e.global.x, e.global.y); 

        });

        this.square.on('pointerdown', onTilesetDragStart)
                .on('pointerup', onTilesetDragEnd)
                .on('pointerupoutside', onTilesetDragEnd);
    }
} // class TilesetContext


class CompositeContext {

    constructor(app) {
        this.app = app;
        this.widthpx  = CONFIG.levelwidth;
        this.heightpx = CONFIG.levelheight;

        this.container = new PIXI.Container();
        this.container.sortableChildren = true;
        this.app.stage.addChild(this.container);
        this.sprites = {};

        this.fudgex = 0; // offset from 0,0
        this.fudgey = 0;

        this.lasttileindex  = -1; 

        this.square = new PIXI.Graphics();
        this.square.rect(0, 0, CONFIG.levelwidth, CONFIG.levelheight);
        this.square.fill(0x2980b9);
        this.square.eventMode = 'static';
        this.container.addChild(this.square);

        this.square.on('mousedown', onCompositeMousedown.bind(null, this));
    }

} // class CompositeContext


function doimport (str) {
    if (globalThis.URL.createObjectURL) {
      const blob = new Blob([str], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      const module = import(url)
      URL.revokeObjectURL(url) // GC objectURLs
      return module
    }
    
    const url = "data:text/javascript;base64," + btoa(moduleData)
    return import(url)
  }


function resetLayers() {
    g_ctx.composite.container.removeChildren();
    g_ctx.composite = new CompositeContext(g_ctx.composite_app);
    g_ctx.g_layer_apps[0].stage.removeChildren()
    g_ctx.g_layers[0] = new LayerContext(g_ctx.g_layer_apps[0], document.getElementById("layer0pane"), 0);
    g_ctx.g_layer_apps[1].stage.removeChildren()
    g_ctx.g_layers[1] = new LayerContext(g_ctx.g_layer_apps[1], document.getElementById("layer1pane"), 1);
    g_ctx.g_layer_apps[2].stage.removeChildren()
    g_ctx.g_layers[2] = new LayerContext(g_ctx.g_layer_apps[2], document.getElementById("layer2pane"), 2);
    g_ctx.g_layer_apps[3].stage.removeChildren()
    g_ctx.g_layers[3] = new LayerContext(g_ctx.g_layer_apps[3], document.getElementById("layer3pane"), 3);

    redrawGrid();
}

window.resetLayers = () => {
    resetLayers();
}

// Save Spritesheet container as a Png file
function downloadpng(filename) {
    let newcontainer = new PIXI.Container();
    let children = [...g_ctx.spritesheet.container.children];
    for(let i = 0; i <  children.length; i++) {
        let child = children[i];
        if (child.label != "Sprite") {
            console.log(child);
            continue;
        }
        // console.log(child, typeof child);
        g_ctx.composite.container.removeChild(child);
        newcontainer.addChild(child);
    }

      g_ctx.tileset_app.renderer.extract.canvas(newcontainer).toBlob(function (b) {
      console.log(b);
      var a = document.createElement("a");
      document.body.append(a);
      a.download = filename;
      a.href = URL.createObjectURL(b);
      a.click();
      a.remove();
    }, "image/png");
  }

window.saveSpriteContainerAsImage = () => {
    fillSpriteContainer();
    downloadpng("g_ctx.sprite.png");
}

function fillSpriteContainer() {
    while (g_ctx.spritesheet.container.children[0]) {
        g_ctx.spritesheet.container.removeChild(g_ctx.spritesheet.container.children[0]);
    }

    var last_max = 0;
    var row_count = 0;
    for (var j = 0; j < g_ctx.g_layers[0].container.children.length; j++) {
        var child = g_ctx.g_layers[0].container.children[j];
        if (child.label != "Sprite") {
            continue;
        }

        if (child.y > last_max) {
            last_max = child.y;
            row_count++;
        }

        var spr = new PIXI.Sprite(child.texture);
        spr.x = child.x;
        spr.y = row_count * g_ctx.leveldimy; // snap always to level rows. 
        g_ctx.spritesheet.container.addChild(spr);
    }
    last_max = 0;
    row_count++;
    for (var j = 0; j < g_ctx.g_layers[1].container.children.length; j++) {
        var child = g_ctx.g_layers[1].container.children[j];
        if (child.label != "Sprite") {
            continue;
        }

        if (child.y > last_max) {
            last_max = child.y;
            row_count++;
        }

        var spr = new PIXI.Sprite(child.texture);
        spr.y = row_count * g_ctx.leveldimy;
        spr.x = child.x;
        g_ctx.spritesheet.container.addChild(spr);
    }
    last_max = 0;
    row_count++;
    for (var j = 0; j < g_ctx.g_layers[2].container.children.length; j++) {
        var child = g_ctx.g_layers[2].container.children[j];
        if (child.label != "Sprite") {
            continue;
        }

        console.log("Y2 " + child.y);
        if (child.y > last_max) {
            last_max = child.y;
            row_count++;
        }

        var spr = new PIXI.Sprite(child.texture);
        spr.y = row_count * g_ctx.leveldimy;
        spr.x = child.x;
        g_ctx.spritesheet.container.addChild(spr);
    }
    last_max = 0;
    row_count++;
    for (var j = 0; j < g_ctx.g_layers[3].container.children.length; j++) {
        var child = g_ctx.g_layers[3].container.children[j];
        if (child.label != "Sprite") {
            continue;
        }

        if (child.y > last_max) {
            last_max = child.y;
            row_count++;
        }

        var spr = new PIXI.Sprite(child.texture);
        spr.y = row_count * g_ctx.leveldimy;
        spr.x = child.x;
        g_ctx.spritesheet.container.addChild(spr);
    }

    g_ctx.spritesheet_app.stage.addChild(g_ctx.spritesheet.container);

}

window.onTab = (evt, tabName) => {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName == "spritesheet"){
        fillSpriteContainer();
    }else {
        g_ctx.composite.app.stage.addChild(g_ctx.composite.container);
    }
}

window.addEventListener(
    "keyup", (event) => {
        if (event.code == "KeyD"){
            g_ctx.dkey = false;
            g_ctx.g_layers.map( (l) => l.container.addChild(l.mouseshadow));
        }
    });
window.addEventListener(
    "keydown", (event) => {

        if (event.code == "KeyD"){
            g_ctx.dkey = true;
            g_ctx.g_layers.map((l) => l.container.removeChild(l.mouseshadow) );
        }

        if (event.code == 'KeyS'){
            SPRITEFILE.generate_sprite_file();
        }
        else if (event.code == 'Escape'){
            g_ctx.selected_tiles = [];
            g_ctx.g_layers.map((l) => l.mouseshadow.removeChildren());
        }
        else if (event.code == 'KeyM'){
            g_ctx.g_layers.map((l) => l.drawFilter () );
        }
        else if (event.ctrlKey && event.code === 'KeyZ'){
            let undome = UNDO.undo_pop();
            if (!undome) {
                return;
            }
            let layer = undome.shift();
            for(let i = 0; i < undome.length; i++) {
                if (g_ctx.debug_flag) {
                    console.log("Undo removing ", undome[i])
                }
                layer.container.removeChild(layer.sprites[undome[i]]);
                g_ctx.composite.container.removeChild(layer.composite_sprites[undome[i]]);
            }
        }
        else if (event.shiftKey && event.code == 'ArrowUp') {
            g_ctx.tileset.fudgey -= 1;
            redrawGridTileset(g_ctx.tileset);
        }
        else if (event.shiftKey && event.code == 'ArrowDown') {
            g_ctx.tileset.fudgey += 1;
            redrawGridTileset(g_ctx.tileset);
        }
        else if (event.shiftKey && event.code == 'ArrowLeft') {
            g_ctx.tileset.fudgex -= 1;
            redrawGridTileset(g_ctx.tileset);
        }
        else if (event.shiftKey && event.code == 'ArrowRight') {
            g_ctx.tileset.fudgex += 1;
            redrawGridTileset(g_ctx.tileset);
        }
     }
  );

// Listen to pointermove on stage once handle is pressed.

function onTilesetDragStart(e)
{
    if (g_ctx.debug_flag) {
        console.log("onDragStartTileset()");
    }
    g_ctx.tileset.app.stage.eventMode = 'static';
    g_ctx.tileset.app.stage.addEventListener('pointermove', onTilesetDrag);
    
    g_ctx.tileset.dragctx.startx = e.global.x;
    g_ctx.tileset.dragctx.starty = e.global.y;
    g_ctx.tileset.dragctx.endx = e.global.x;
    g_ctx.tileset.dragctx.endy = e.global.y;

    g_ctx.tileset.app.stage.addChild(g_ctx.tileset.dragctx.square);
    // g_ctx.tileset.app.stage.addChild(g_ctx.tileset.dragctx.tooltip);

    g_ctx.selected_tiles = [];
}

// Stop dragging feedback once the handle is released.
function onTilesetDragEnd(e)
{
    if (g_ctx.debug_flag) {
        console.log("onDragEndTileset()");
    }
    g_ctx.tileset.app.stage.eventMode = 'auto';
    g_ctx.tileset.app.stage.removeEventListener('pointermove', onTilesetDrag);
    g_ctx.tileset.app.stage.removeChild(g_ctx.tileset.dragctx.square);
    g_ctx.tileset.app.stage.removeChild(g_ctx.tileset.dragctx.tooltip);

    let starttilex = Math.floor((g_ctx.tileset.dragctx.startx - g_ctx.tileset.fudgex) / (g_ctx.tiledimx + g_ctx.tilepadding));
    let starttiley = Math.floor((g_ctx.tileset.dragctx.starty - g_ctx.tileset.fudgey) / (g_ctx.tiledimy + g_ctx.tilepadding));
    let endtilex = Math.floor((g_ctx.tileset.dragctx.endx - g_ctx.tileset.fudgex) / (g_ctx.tiledimx + g_ctx.tilepadding));
    let endtiley = Math.floor((g_ctx.tileset.dragctx.endy - g_ctx.tileset.fudgey) / (g_ctx.tiledimy + g_ctx.tilepadding));

    if (g_ctx.debug_flag) {
        console.log("sx sy ex ey ", starttilex, ",", starttiley, ",", endtilex, ",", endtiley);
    }
    // let mouse clicked handle if there isn't a multiple tile square
    if (starttilex === endtilex && starttiley === endtiley) {
        if (g_ctx.debug_flag) {
            console.log("onDragEndTileset() -- letting mouse down handle it");
        }
        return;
    }

    g_ctx.tile_index = tileset_index_from_px(e.global.x, e.global.y); 

    let origx = starttilex;
    let origy = starttiley;
    for(let y = starttiley; y <= endtiley; y++){
        for(let x = starttilex; x <= endtilex; x++){
            let squareindex = (y * g_ctx.tilesettilew) + x;
            console.log("Pushing into st ", x - origx,y - origy, squareindex);
            g_ctx.selected_tiles.push([x - origx,y - origy,squareindex]);
        }
    }

    g_ctx.tileset.dragctx.square.clear();
}

function onTilesetDrag(e)
{
    if (g_ctx.debug_flag) {
        console.log("onDragTileset()");
    }
    g_ctx.tileset.dragctx.endx = e.global.x;
    g_ctx.tileset.dragctx.endy = e.global.y;
    
    g_ctx.tileset.dragctx.square.clear();
    g_ctx.tileset.dragctx.square.setStrokeStyle(2, 0xffd900, 1);
    g_ctx.tileset.dragctx.square.moveTo(g_ctx.tileset.dragctx.startx, g_ctx.tileset.dragctx.starty);
    g_ctx.tileset.dragctx.square.lineTo(g_ctx.tileset.dragctx.endx, g_ctx.tileset.dragctx.starty);
    g_ctx.tileset.dragctx.square.lineTo(g_ctx.tileset.dragctx.endx, g_ctx.tileset.dragctx.endy);
    g_ctx.tileset.dragctx.square.lineTo(g_ctx.tileset.dragctx.startx, g_ctx.tileset.dragctx.endy);
    g_ctx.tileset.dragctx.square.closePath();
    g_ctx.tileset.dragctx.square.fill({color: 0xFF3300, alpha: 0.3,});


    // g_ctx.tileset.dragctx.tooltip.clear();
    // g_ctx.tileset.dragctx.tooltip.beginFill(0xFF3300, 0.3);
    // g_ctx.tileset.dragctx.tooltip.lineStyle(2, 0xffd900, 1);
    // g_ctx.tileset.dragctx.tooltip.drawRect(e.global.x, e.global.y, 20,8);
    // g_ctx.tileset.dragctx.tooltip.endFill();
}

function redrawGridTileset(pane) {

    if (typeof pane.gridgraphics != 'undefined') {
        pane.container.removeChild(pane.gridgraphics);
    }

    pane.gridgraphics = new PIXI.Graphics();
    let gridsizex = (g_ctx.tiledimx + g_ctx.tilepadding);
    let gridsizey = (g_ctx.tiledimy + g_ctx.tilepadding);
    
    for (let i = 0; i < pane.widthpx; i += gridsizex) {
        pane.gridgraphics.moveTo(i + pane.fudgex, 0 + pane.fudgey)
            .lineTo(i + pane.fudgex, pane.heightpx + pane.fudgey)
            .moveTo(i + gridsizex + pane.fudgex, 0 + pane.fudgey)
            .lineTo(i + gridsizex + pane.fudgex, pane.heightpx + pane.fudgey);
        pane.gridgraphics.stroke({ color: 0x000000, width: 1 + g_ctx.tilepadding });
    }
    for (let j = 0; j < pane.heightpx; j += gridsizey) {
        pane.gridgraphics.moveTo(0 + pane.fudgex, j + gridsizey + pane.fudgey)
             .lineTo(pane.widthpx + pane.fudgex, j + gridsizey + pane.fudgey)
             .moveTo(0 + pane.fudgex, j + pane.fudgey)
             .lineTo(pane.heightpx + pane.fudgex, j + pane.fudgey);
        pane.gridgraphics.stroke({ color: 0x000000, width: 1 + g_ctx.tilepadding });
    }

    pane.container.addChild(pane.gridgraphics);
    //pane.gridvisible = true;
}

function redrawGridLevel(pane) {

    if (typeof pane.gridgraphics != 'undefined') {
        pane.container.removeChild(pane.gridgraphics);
    }

    pane.gridgraphics = new PIXI.Graphics();
    let gridsizex = g_ctx.leveldimx;
    let gridsizey = g_ctx.leveldimy;
    
    for (let i = 0; i < pane.widthpx; i += gridsizex) {
        pane.gridgraphics.moveTo(i + pane.fudgex, 0 + pane.fudgey)
            .lineTo(i + pane.fudgex, pane.heightpx + pane.fudgey)
            .moveTo(i + gridsizex + pane.fudgex, 0 + pane.fudgey)
            .lineTo(i + gridsizex + pane.fudgex, pane.heightpx + pane.fudgey);
        pane.gridgraphics.stroke({ color: 0x000000, width: 1 });
    }
    for (let j = 0; j < pane.heightpx; j += gridsizey) {
        pane.gridgraphics.moveTo(0 + pane.fudgex, j + gridsizey + pane.fudgey)
             .lineTo(pane.widthpx + pane.fudgex, j + gridsizey + pane.fudgey)
             .moveTo(0 + pane.fudgex, j + pane.fudgey)
             .lineTo(pane.heightpx + pane.fudgex, j + pane.fudgey);
        pane.gridgraphics.stroke({ color: 0x000000, width: 1 });
    }

    pane.container.addChild(pane.gridgraphics);
    //pane.gridvisible = true;
}


function redrawGrid() {
    g_ctx.g_layers.map((l) => redrawGridLevel(l));
    redrawGridTileset(g_ctx.tileset); 
    redrawGridLevel(g_ctx.composite);
}


// --
// Variable placement logic Level1
// --

function centerCompositePane(x, y){
    var compositepane = document.getElementById("compositepane");
    compositepane.scrollLeft = x - (CONFIG.htmlCompositePaneW/2);
    compositepane.scrollTop  = y - (CONFIG.htmlCompositePaneH/2);
}

function centerLayerPanes(x, y){
    // TODO remove magic number pulled from index.html
    g_ctx.g_layers.map((l) => {
        l.scrollpane.scrollLeft = x - (CONFIG.htmlCompositePaneW/2);
        l.scrollpane.scrollTop  = y - (CONFIG.htmlCompositePaneH/2);
      });
}

function onLevelMouseover(e) {
    let x = e.data.global.x;
    let y = e.data.global.y;
    if(g_ctx.debug_flag){
        console.log("onLevelMouseOver ",this.num);
    }
    if (x < this.scrollpane.scrollLeft || x > this.scrollpane.scrollLeft + CONFIG.htmlCompositePaneW) {
        return;
    }
    if (y < this.scrollpane.scrollTop || y > this.scrollpane.scrollTop + CONFIG.htmlCompositePaneH) {
        return;
    }

    if (this.lasttileindex != g_ctx.tile_index) {

        this.mouseshadow.removeChildren(0);
        if (g_ctx.selected_tiles.length == 0) {

            let shadowsprite = null;
            let shadowsprite2 = null;

            let pxloc = tileset_px_from_index(g_ctx.tile_index);
            console.log("onLevelMouseOver pxloc: "+pxloc);
            shadowsprite  = sprite_from_px(pxloc[0] + g_ctx.tileset.fudgex, pxloc[1] + g_ctx.tileset.fudgey);
            shadowsprite2 = sprite_from_px(pxloc[0] + g_ctx.tileset.fudgex, pxloc[1] + g_ctx.tileset.fudgey);

            shadowsprite.alpha = .5;
            shadowsprite2.alpha = .5;
            this.mouseshadow.addChild(shadowsprite);
        } else {
            // TODO! adjust for fudge
            for (let i = 0; i < g_ctx.selected_tiles.length; i++) {
                let tile = g_ctx.selected_tiles[i];
                console.log("TILE", tile);
                let pxloc = tileset_px_from_index(tile[2]);
                console.log('PXLOC',pxloc);


                const shadowsprite  = sprite_from_px(pxloc[0] + g_ctx.tileset.fudgex, pxloc[1] + g_ctx.tileset.fudgey);
                const shadowsprite2 = sprite_from_px(pxloc[0] + g_ctx.tileset.fudgex, pxloc[1] + g_ctx.tileset.fudgey);
                shadowsprite.x = tile[0] * g_ctx.tiledimx;
                shadowsprite.y = tile[1] * g_ctx.tiledimy;
                shadowsprite2.x = tile[0] * g_ctx.tiledimx;
                shadowsprite2.y = tile[1] * g_ctx.tiledimy;
                shadowsprite.alpha = .5;
                shadowsprite2.alpha = .5;
                this.mouseshadow.addChild(shadowsprite);
            }

        }
        this.mouseshadow.x = x - 16;
        this.mouseshadow.y = y - 16;
        this.container.removeChild(this.mouseshadow);
        this.container.addChild(this.mouseshadow);
    }

}


function onLevelMouseOut(e) {
    if (g_ctx.debug_flag) {
        console.log("onLevelMouseOut ",this.num);
    }
    this.mouseshadow.removeChildren(0);
}

function onLevelMousemove(e) {
    let x = e.data.global.x;
    let y = e.data.global.y;

    // FIXME TEST CODE
    this.mouseshadow.x = x-8;
    this.mouseshadow.y = y-8;
    // FIXME TEST CODE


    if (x < this.scrollpane.scrollLeft || x > this.scrollpane.scrollLeft + CONFIG.htmlCompositePaneW) {
        return;
    }
    if (y < this.scrollpane.scrollTop || y > this.scrollpane.scrollTop + CONFIG.htmlCompositePaneH) {
        return;
    }
}
function onCompositeMousedown(layer, e) {
    if (g_ctx.debug_flag) {
        console.log('onCompositeMouseDown: X', e.data.global.x, 'Y', e.data.global.y);
    }

    let xorig = e.data.global.x;
    let yorig = e.data.global.y;

    centerLayerPanes(xorig,yorig);
}


// Place with no variable target at destination
function levelPlaceNoVariable(layer, e) {
    if (g_ctx.debug_flag) {
        console.log('levelPlaceNoVariable: X', e.data.global.x, 'Y', e.data.global.y);
    }

    let xorig = e.global.x;
    let yorig = e.global.y;

    // No need to center pane
    // centerCompositePane(xorig,yorig);

    if (g_ctx.dkey || g_ctx.selected_tiles.length == 0) {
        let ti = layer.addTileLevelPx(e.global.x, e.global.y, g_ctx.tile_index);
        UNDO.undo_add_single_index_as_task(layer, ti);
    } else {
        let undolist = [];
        UNDO.undo_mark_task_start(layer);
        for (let index of g_ctx.selected_tiles) {
            let ti = layer.addTileLevelPx(xorig + index[0] * g_ctx.tiledimx, yorig + index[1] * g_ctx.tiledimy, index[2]);
            UNDO.undo_add_index_to_task(ti);
        }
        UNDO.undo_mark_task_end();
    }

    layer.updateAnimatedTiles();
}

// Listen to pointermove on stage once handle is pressed.
function onLevelPointerDown(layer, e)
{
    if (g_ctx.debug_flag) {
        console.log("onLevelPointerDown()");
    }
    layer.app.stage.eventMode = 'static';
    layer.app.stage.addEventListener('pointermove', onLevelDrag.bind(null, layer, e));

    layer.container.removeChild(layer.mouseshadow);

    layer.dragctx.startx = e.data.global.x;
    layer.dragctx.starty = e.data.global.y;
    layer.dragctx.endx = e.data.global.x;
    layer.dragctx.endy = e.data.global.y;

    layer.app.stage.addChild(layer.dragctx.square);
    layer.app.stage.addChild(layer.dragctx.tooltip);
}

function onLevelDrag(layer, e)
{
    if(layer.dragctx.startx == -1){
        layer.dragctx.square.clear();
        return;
    }

    layer.dragctx.endx = e.global.x;
    layer.dragctx.endy = e.global.y;

    if (g_ctx.debug_flag) {
        console.log("onLevelDrag()");
    }
    
    layer.dragctx.square.clear();
    layer.dragctx.square.setStrokeStyle(2, 0xffd900, 1);
    layer.dragctx.square.moveTo(layer.dragctx.startx, layer.dragctx.starty);
    layer.dragctx.square.lineTo(layer.dragctx.endx, layer.dragctx.starty);
    layer.dragctx.square.lineTo(layer.dragctx.endx, layer.dragctx.endy);
    layer.dragctx.square.lineTo(layer.dragctx.startx, layer.dragctx.endy);
    layer.dragctx.square.closePath();
    layer.dragctx.square.fill({color: 0xFF3300, alpha: 0.3,});

    const vwidth  = Math.floor((layer.dragctx.endx - layer.dragctx.startx)/g_ctx.tiledimx);
    const vheight = Math.floor((layer.dragctx.endy - layer.dragctx.starty)/g_ctx.tiledimy);
    layer.dragctx.tooltip.x = e.global.x + 16;
    layer.dragctx.tooltip.y = e.global.y - 4;
    layer.dragctx.tooltip.text = "["+vwidth+","+vheight+"]\n"+
                                 "("+Math.floor(e.global.x/g_ctx.tiledimx)+","+Math.floor(e.global.y/g_ctx.tiledimy)+")";
    //layer.dragctx.tooltip.text = "("+e.global.x+","+e.global.y+")";
}

function onLevelCreateAnimatedSprite(row) {


}

// Stop dragging feedback once the handle is released.
function onLevelDragEnd(layer, e)
{
    layer.dragctx.endx = e.data.global.x;
    layer.dragctx.endy = e.data.global.y;

    if(layer.dragctx.startx == -1){
        console.log("onLevelDragEnd() start is -1 bailing");
        return;
    }
    if (g_ctx.debug_flag) {
        console.log("onLevelDragEnd()");
    }

    layer.container.addChild(layer.mouseshadow);

    layer.app.stage.eventMode = 'auto';
    layer.app.stage.removeChild(layer.dragctx.square);
    layer.app.stage.removeChild(layer.dragctx.tooltip);

    let starttilex = Math.floor(layer.dragctx.startx / g_ctx.tiledimx);
    let starttiley = Math.floor(layer.dragctx.starty / g_ctx.tiledimy);
    let endtilex = Math.floor(layer.dragctx.endx / g_ctx.tiledimx);
    let endtiley = Math.floor(layer.dragctx.endy / g_ctx.tiledimy);

    if (g_ctx.debug_flag) {
        console.log("sx ", starttilex, " ex ", endtilex);
        console.log("sy ", starttiley, " ey ", endtiley);
    }

    // no variable placement. 
    if(starttilex === endtilex && starttiley == endtiley ){
        levelPlaceNoVariable(layer, e);
        layer.dragctx.startx = -1;
        layer.dragctx.endx    = -1;
        layer.dragctx.starty = -1;
        layer.dragctx.endy    = -1;
        return;
    }

    if (g_ctx.selected_tiles.length == 0) {
        UNDO.undo_mark_task_start(layer);
        for (let i = starttilex; i <= endtilex; i++) {
            for (let j = starttiley; j <= endtiley; j++) {
                let squareindex = (j * g_ctx.tilesettilew) + i;
                let ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, g_ctx.tile_index);
                UNDO.undo_add_index_to_task(ti);
            }
        }
        UNDO.undo_mark_task_end();
    } else {
        // figure out selected grid
        let selected_grid = Array.from(Array(64), () => new Array(64)); // FIXME ... hope 64x64 is enough
        let row = 0;
        let column = 0;
        let selected_row = g_ctx.selected_tiles[0][1];
        // selected_grid[0] = [];
        for (let index of g_ctx.selected_tiles) {
            // console.log("Selected row ", selected_row, index);
            if(index[1] != selected_row){
                selected_row = index[1];
                row++;
                column = 0;
                //selected_grid[row] = [];
            }
            selected_grid[column++][row]  = index;
        }
        // at this point should have a 3D array of the selected tiles and the size should be row, column

        UNDO.undo_mark_task_start(layer);

        let ti=0;
        for (let i = starttilex; i <= endtilex; i++) {
            for (let j = starttiley; j <= endtiley; j++) {
                let squareindex = (j * g_ctx.tilesettilew) + i;
                if (j === starttiley) { // first row 
                    if (i === starttilex) { // top left corner
                        ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, selected_grid[0][0][2]);
                    }
                    else if (i == endtilex) { // top right corner
                        ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, selected_grid[column - 1][0][2]);
                    } else { // top middle
                        ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, selected_grid[1][0][2]);
                    }
                } else if (j === endtiley) { // last row
                    if (i === starttilex) { // bottom left corner
                        ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, selected_grid[0][row][2]);
                    }
                    else if (i == endtilex) { // bottom right corner
                        ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, selected_grid[column - 1][row][2]);
                    } else { // bottom middle
                        ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, selected_grid[1][row][2]);
                    }
                } else { // middle row
                    if (i === starttilex) { // middle left 
                        ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, selected_grid[0][(row > 0)? 1 : 0][2]);
                    }
                    else if (i === endtilex) { // middle end 
                        ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, selected_grid[column - 1][(row > 0)? 1 : 0][2]);
                    } else { // middle middle
                        ti = layer.addTileLevelPx(i * g_ctx.tiledimx, j * g_ctx.tiledimy, selected_grid[1][(row > 0)? 1 : 0][2]);
                    }
                }
                UNDO.undo_add_index_to_task(ti);
            }
        }
        UNDO.undo_mark_task_end();
    }

    layer.dragctx.square.clear();

    layer.dragctx.startx = -1;
    layer.dragctx.starty = -1;
}



// --
// Initialized all pixi apps / components for application
// --
function initPixiApps() {

    // -- Editor wide globals --

    // First layer of level
    const level_app0 = new PIXI.Application();
    level_app0.init({ backgroundColor: 0x2980b9, width: CONFIG.levelwidth, height: CONFIG.levelheight, canvas: document.getElementById('level0') });
    let layer0 = new LayerContext(level_app0, document.getElementById("layer0pane"), 0);

    // second layer of level 
    const level_app1 = new PIXI.Application();
    level_app1.init({ backgroundColor: 0x2980b9, width: CONFIG.levelwidth, height: CONFIG.levelheight, canvas: document.getElementById('level1') });
    let layer1 = new LayerContext(level_app1, document.getElementById("layer1pane"), 1);

    //  object layer of level
    const level_app2 = new PIXI.Application();
    level_app2.init({ backgroundColor: 0x2980b9, width: CONFIG.levelwidth, height: CONFIG.levelheight, canvas: document.getElementById('level3') });
    let layer2 = new LayerContext(level_app2, document.getElementById("layer2pane"), 2);

    //  object layer of level
    const level_app3 = new PIXI.Application();
    level_app3.init({ backgroundColor: 0x2980b9, width: CONFIG.levelwidth, height: CONFIG.levelheight, canvas: document.getElementById('level4') });

    let layer3 = new LayerContext(level_app3, document.getElementById("layer3pane"), 3);

    g_ctx.g_layer_apps = [];
    g_ctx.g_layer_apps.push(level_app0 );
    g_ctx.g_layer_apps.push(level_app1);
    g_ctx.g_layer_apps.push(level_app2);
    g_ctx.g_layer_apps.push(level_app3);


    g_ctx.g_layers = [];
    g_ctx.g_layers.push(layer0);
    g_ctx.g_layers.push(layer1);
    g_ctx.g_layers.push(layer2);
    g_ctx.g_layers.push(layer3);

    // g_ctx.composite view 
    g_ctx.composite_app = new PIXI.Application();
    g_ctx.composite_app.init({ backgroundAlpha: 0, width: CONFIG.levelwidth, height: CONFIG.levelheight, canvas: document.getElementById('composite') });
    g_ctx.composite = new CompositeContext(g_ctx.composite_app);

    //  map tab 
    g_ctx.spritesheet_app = new PIXI.Application();
    g_ctx.spritesheet_app.init({ backgroundColor: 0x2980b9, width: CONFIG.levelwidth, height: CONFIG.levelheight, canvas: document.getElementById('spritecanvas') });
    g_ctx.spritesheet = new SpritesheetContext(g_ctx.spritesheet_app)

    // g_ctx.tileset
    g_ctx.tileset_app = new PIXI.Application();
    g_ctx.tileset_app.init({ width: 5632 , height: 8672, canvas: document.getElementById('tileset') });
    g_ctx.tileset = new TilesetContext(g_ctx.tileset_app);
}

function initDimXY() {
    var tilepadding  = document.getElementById("gettilepadding");
    var tiledimx = document.getElementById("gettiledimx");
    var tiledimy = document.getElementById("gettiledimy");
    var leveldimx = document.getElementById("getleveldimx");
    var leveldimy = document.getElementById("getleveldimy");

    console.log("initDIMXY padding"+tilepadding.value);
    console.log("initDIMXY "+tiledimx.value+" : "+tiledimy.value);
    console.log("initDIMXY "+leveldimx.value+" : "+leveldimy.value);

    g_ctx.tilepadding = Number(tilepadding.value);
    g_ctx.tiledimx    = Number(tiledimx.value);
    g_ctx.tiledimy    = Number(tiledimy.value);
    g_ctx.leveldimx   = Number(leveldimx.value);
    g_ctx.leveldimy   = Number(leveldimy.value);

    tilepadding.addEventListener('change', function () {
        console.log("tilepadding change "+this.value);
        g_ctx.tilepadding = Number(this.value);
        resetTileGridParams();
        redrawGrid();
    });
    tiledimx.addEventListener('change', function () {
        console.log("dimx change "+this.value);
        g_ctx.tiledimx = Number(this.value);
        resetTileGridParams();
        redrawGrid();
    });
    tiledimy.addEventListener('change', function () {
        console.log("dimy change "+ this.value);
        g_ctx.tiledimy = Number(this.value);
        resetTileGridParams();
        redrawGrid();
    });
    leveldimx.addEventListener('change', function () {
        console.log("dimx change "+this.value);
        g_ctx.leveldimx = Number(this.value);
        //resetlevelGridParams();
        redrawGrid();
    });
    leveldimy.addEventListener('change', function () {
        console.log("dimy change "+ this.value);
        g_ctx.leveldimy = Number(this.value);
        ////resetlevelGridParams();
        redrawGrid();
    });
}

// --
// Load in default tileset and use to set properties
// --

function resetTileGridParams() {
    // when grid dimensions change, recalculate width / height by tiles 

     // size of g_ctx.tileset in tiles
     let tileandpad = g_ctx.tiledimx + g_ctx.tilepadding;
     let numtilesandpadw = Math.floor(g_ctx.tilesetpxw / tileandpad);
     g_ctx.tilesettilew = numtilesandpadw + Math.floor((g_ctx.tilesetpxw - (numtilesandpadw * tileandpad))/g_ctx.tiledimx);
     let numtilesandpadh = Math.floor(g_ctx.tilesetpxh / tileandpad);
     g_ctx.tilesettileh = numtilesandpadh + Math.floor((g_ctx.tilesetpxh - (numtilesandpadh * tileandpad))/g_ctx.tiledimy);
     console.log("Number of x tiles ",g_ctx.tilesettilew," y tiles ",g_ctx.tilesettileh);

}

const initTilesConfig = async (path = CONFIG.DEFAULTTILESETPATH) => {

    g_ctx.tilesetpath = path; 

    const texture = await PIXI.Assets.load(g_ctx.tilesetpath);
    console.log("Loaded texture "+g_ctx.tilesetpath);

     // size of g_ctx.tileset in px
     g_ctx.tilesetpxw = texture.width;
     g_ctx.tilesetpxh = texture.height;
     console.log("Texture size w:", g_ctx.tilesetpxw, "h:", g_ctx.tilesetpxh);

     resetTileGridParams();
  };


async function initTiles() {
    const texture = await PIXI.Assets.load(g_ctx.tilesetpath);
}

async function newTilesetFromFile(){
    await initTilesConfig(g_ctx.tilesetpath)

    g_ctx.tileset_app.stage.removeChildren()
    g_ctx.tileset = new TilesetContext(g_ctx.tileset_app);
    g_ctx.g_layer_apps[0].stage.removeChildren()

    resetLayers();
}

async function init() {

    UI.initMainHTMLWindow();

    initDimXY(); // must be called before loading tileset

    await initTilesConfig(); // needs to be called before Pixi apps are initialized

    initPixiApps();
    initTiles();
    UI.initTilesetLoader(newTilesetFromFile); 

    redrawGrid();
}

init();