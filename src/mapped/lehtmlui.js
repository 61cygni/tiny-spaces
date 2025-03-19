import * as PIXI from 'pixi.js'
import { g_ctx }  from '../shared/lecontext.js' // global context
import * as CONFIG from '../shared/leconfig.js' 
import * as UTIL from   '../shared/eutils.js' 

// --
//  Set sizes and limits for HTML in main UI
// --

export function initMainHTMLWindow() {
    document.getElementById("layer0pane").style.maxWidth  = ""+CONFIG.htmlLayerPaneW+"px"; 
    document.getElementById("layer0pane").style.maxHeight = ""+CONFIG.htmlLayerPaneH+"px"; 
    document.getElementById("layer1pane").style.maxWidth  = ""+CONFIG.htmlLayerPaneW+"px"; 
    document.getElementById("layer1pane").style.maxHeight = ""+CONFIG.htmlLayerPaneH+"px"; 
    document.getElementById("layer2pane").style.maxWidth  = ""+CONFIG.htmlLayerPaneW+"px"; 
    document.getElementById("layer2pane").style.maxHeight = ""+CONFIG.htmlLayerPaneH+"px"; 
    document.getElementById("layer3pane").style.maxWidth  = ""+CONFIG.htmlLayerPaneW+"px"; 
    document.getElementById("layer3pane").style.maxHeight = ""+CONFIG.htmlLayerPaneH+"px"; 

    document.getElementById("tilesetpane").style.maxWidth  = ""+CONFIG.htmlTilesetPaneW+"px"; 
    document.getElementById("tilesetpane").style.maxHeight = ""+CONFIG.htmlTilesetPaneH+"px";
    document.getElementById("compositepane").style.maxWidth  = ""+CONFIG.htmlCompositePaneW+"px"; 
    document.getElementById("compositepane").style.maxHeight = ""+CONFIG.htmlCompositePaneH+"px";


    document.getElementById("gettiledimx").value = CONFIG.DEFAULTILEDIMX;
    document.getElementById("gettiledimy").value = CONFIG.DEFAULTILEDIMY; 

    // hide map tab
    let mappane = document.getElementById("map");
    mappane.style.display = "none";
}

// --
// Initialize handlers for file loading
// --



// --
// Initialize handlers loading a PNG file into the composite window 
// --

export async function loadCompositPNG(filename) {
    let texture = await PIXI.Assets.load(filename);
    const bg = new PIXI.Sprite(texture);
    bg.x = 1;
    bg.y = 5;
    bg.zIndex = 0;
    g_ctx.composite.container.addChild(bg);
}

export function initCompositePNGLoader() {
    const fileInput = document.getElementById('compositepng');
    fileInput.onchange = async (evt) => {
        if (!window.FileReader) return; // Browser is not compatible
        if (g_ctx.debug_flag) {
            console.log("compositepng ", fileInput.files[0].name);
        }
        let bgname = fileInput.files[0].name;
        await loadCompositPNG("./tilesets/" + bgname);
    }
}

// -- 
// initailized handler to load a spriteSheet into current working tile
// --

export async function loadSpriteSheet(filename) {
    console.log("loadSpriteSheet ", filename);
    console.trace();
    let sheet = await PIXI.Assets.load('./spritesheets/' + filename);
    // console.log(sheet);
    g_ctx.tileset.addTileSheet(filename, sheet);
    g_ctx.selected_tiles = [];
}

export function initSpriteSheetLoader() {
    const fileInput = document.getElementById('spritesheet');
    fileInput.onchange = async (evt) => {
        if (!window.FileReader) return; // Browser is not compatible
        if (g_ctx.debug_flag) {
            console.log("spritesheet ", fileInput.files[0].name);
        }
        let ssname = fileInput.files[0].name;
        await loadSpriteSheet(ssname);
    }
}

// -- 
// initailized handler to load a new tileset 
// --

export function initTilesetLoader(callme) {
    const fileInput = document.getElementById('tilesetfile');
    fileInput.onchange = async (evt) => {
        if (!window.FileReader) return; // Browser is not compatible
        if (g_ctx.debug_flag) {
            console.log("tilesetfile ", fileInput.files[0].name);
        }
        g_ctx.tilesetpath =  "./tilesets/"+fileInput.files[0].name;

        callme();
    }
}


// -- 
// initailized handler to load a level from a file 
// --

async function readFileSync(fileUrl) {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contents = await response.text(); // or response.json() for JSON files
        console.log('File contents:', contents);
        return contents;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error; // Re-throw the error if you want calling code to handle it
    }
}

export function loadLevel(filename, callme) {
    console.log('Loading level from '+filename);
    UTIL.readFile(filename, (content) => {
        UTIL.doimport(content).then(mod => callme(mod));
    });
}

export function initLevelLoader(callme) {
    let filecontent = "";

    const fileInput = document.getElementById('levelfile');
    fileInput.onchange = (evt) => {
        if (!window.FileReader) return; // Browser is not compatible

        var reader = new FileReader();

        reader.onload = function (evt) {
            if (evt.target.readyState != 2) return;
            if (evt.target.error) {
                alert('Error while reading file');
                return;
            }

            filecontent = evt.target.result;
            UTIL.doimport(filecontent).then(mod => callme(mod));
        };

        reader.readAsText(evt.target.files[0]);
    }
}