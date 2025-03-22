
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

export const htmlLayerPaneW = 800;
export const htmlLayerPaneH = 600;

export const htmlTilesetPaneW = 800;
export const htmlTilesetPaneH = 600;

export const htmlCompositePaneW = 800;
export const htmlCompositePaneH = 600;

// --  zIndex

// 1-10 taken by layers
export const zIndexFilter           =  20;
export const zIndexMouseShadow      =  30;
export const zIndexGrid             =  50;
export const zIndexCompositePointer =  100;
