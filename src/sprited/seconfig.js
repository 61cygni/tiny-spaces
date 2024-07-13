
export const DEFAULTTILESETPATH = "./spritesheets/ps2-alpha.png";

// width / height of layer panes
export const levelwidth  = 2048; // px
export const levelheight = 1536; // px

// HACK!
// FIXME! Need to get rid of defaultdimx and have levelwidth / height calculated dynamically
export const DEFAULTILEDIMX = 32; // px
export const DEFAULTILEDIMY = 32; // px

export let leveltilewidth  = Math.floor(levelwidth / DEFAULTILEDIMX);
export let leveltileheight = Math.floor(levelheight / DEFAULTILEDIMX);

// -- HTML

export const htmlLayerPaneW = 400;
export const htmlLayerPaneH = 300;

export const htmlTilesetPaneW = 400;
export const htmlTilesetPaneH = 300;

export const htmlCompositePaneW = 400;
export const htmlCompositePaneH = 300;

// --  zIndex

// 1-10 taken by layers
export const zIndexFilter           =  20;
export const zIndexMouseShadow      =  30;
export const zIndexGrid             =  50;
export const zIndexCompositePointer =  100;