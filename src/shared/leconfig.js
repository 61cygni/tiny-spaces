
// Hardwire presets
export const DEFAULTTILESETPATH  = "../mapped/tilesets/fantasy-interior.png";
export const DEFAULTCOMPOSITEPNG = "";
//export const DEFAULTCOMPOSITEPNG = "../ps1/overworld_palma.png"

export const DEFAULTLEVEL        = "";
//export const DEFAULTLEVEL        = "../ps1/palma.js"

//export const DEFAULTSPRITESHEET  = "";
export const DEFAULTSPRITESHEET  = "../ps1/palma-sprite.json" 

export const SAVEMAPFILENAME     = "map-out.js"; // 
//export const SAVEMAPFILENAME     = "map.js"; // 


//export const DEFAULTTILESETPATH = "./tilesets/magecity.png";
//export const DEFAULTTILESETPATH = "./tilesets/forest.png";
//export const DEFAULTTILESETPATH = "./tilesets/Serene.png";
//export const DEFAULTTILESETPATH = "./tilesets/gentletreewall.png";
//export const DEFAULTTILESETPATH = "./tilesets/Modern.png";
//export const DEFAULTTILESETPATH = "./tilesets/phantasy2.png";

export const tilesetpadding = 0; 


export const DEFAULTILEDIMX = 24; // px
export const DEFAULTILEDIMY = 24; // px

export const levelwidth  = 1984; // px
export const levelheight = 1488; // px

export let leveltilewidth  = Math.floor(levelwidth / DEFAULTILEDIMX);
export let leveltileheight = Math.floor(levelheight / DEFAULTILEDIMX);

export const MAXTILEINDEX = leveltilewidth * leveltileheight;


// -- HTML

export const htmlLayerPaneW = 800;
export const htmlLayerPaneH = 600

export const htmlTilesetPaneW = 800;
export const htmlTilesetPaneH = 600;

export const htmlCompositePaneW = 800;
export const htmlCompositePaneH = 600;

// --  zIndex

// 1-10 taken by layers
export const zIndexLabel            =  15;
export const zIndexFilter           =  20;
export const zIndexMouseShadow      =  30;
export const zIndexGrid             =  50;
export const zIndexCompositePointer =  100;
