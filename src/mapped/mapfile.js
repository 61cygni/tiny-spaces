import * as CONFIG from '../shared/leconfig.js' 
import * as UTIL   from '../shared/eutils.js'
import { g_ctx }  from '../shared/lecontext.js' // global context



function generate_preamble() {
    const mapfile_preamble = '' +
        '// Map generated by assettool.js [' + new Date() + ']\n' +
        '\n' +
        'export const tilesetpath = "' + g_ctx.tilesetpath + '"\n' +
        'export const tiledimx = ' + g_ctx.tiledimx + '\n' +
        'export const tiledimy = ' + g_ctx.tiledimy + '\n' +
        'export const screenxtiles = ' + g_ctx.tilesettilew + '\n' +
        'export const screenytiles = ' + g_ctx.tilesettileh + '\n' +
        'export const tilesetpxw = ' + g_ctx.tilesetpxw + '\n' +
        'export const tilesetpxh = ' + g_ctx.tilesetpxh + '\n\n'

       return mapfile_preamble; 
}

const bgtile_string_start = '' +
    'export const bgtiles = [\n' +
    '   [\n'

function write_map_file(bg_tiles_0, bg_tiles_1, obj_tiles_1, obj_tiles_2, animated_tiles){
    let text = generate_preamble(); 
    text += bgtile_string_start;

    for(let row = 0; row < bg_tiles_0.length; row++) {
        text += '[ ';
        for(let column = 0; column < bg_tiles_0[row].length; column++) {
            text += bg_tiles_0[row][column];
            if (column != bg_tiles_0.length - 1){
                text += ' , ';
            }
        }
        text += '],\n';
    }
    text += '],\n';
    text += '[\n';
    for(let row = 0; row < bg_tiles_1.length; row++) {
        text += '[ ';
        for(let column = 0; column < bg_tiles_1[row].length; column++) {
            text += bg_tiles_1[row][column];
            if (column != bg_tiles_1.length - 1){
                text += ' , ';
            }
        }
        text += '],\n';
    }
    text += '],];\n\n';

    text += ''+
    'export const objmap = [\n'+
    '[\n';

    for(let row = 0; row < obj_tiles_1.length; row++) {
        text += '[ ';
        for(let column = 0; column < obj_tiles_1[row].length; column++) {
            text += obj_tiles_1[row][column];
            if (column != obj_tiles_1.length - 1){
                text += ' , ';
            }
        }
        text += '],\n';
    }
    text += '],\n';
    text += '[\n';

    for(let row = 0; row < obj_tiles_2.length; row++) {
        text += '[ ';
        for(let column = 0; column < obj_tiles_2[row].length; column++) {
            text += obj_tiles_2[row][column];
            if (column != obj_tiles_2.length - 1){
                text += ' , ';
            }
        }
        text += '],\n';
    }
    text += '],];\n';


    // animated sprites list
    text += ''+
    'export const animatedsprites = [\n';

    for(let x = 0 ; x < animated_tiles.length; x++){
        let atile = animated_tiles[x];
        text += '{ x: '+atile.x+", y: "+ atile.y+ ", w: "+ atile.width+ ", h: "+ atile.height ; 
        text += ', layer: '+atile.layer;
        text += ', sheet: "'+ atile.spritesheetname+ '", animation: "'+ atile.animationname+'" },\n';
    }

    text += '];\n\n';


    // Map labels 
    text += ''+
    'export const maplabels = [\n';

    let map_labels = g_ctx.composite.labels;
    for(let x = 0 ; x < map_labels.length; x++){
        let alabel = map_labels[x];
        text += '{ sx: '+alabel.sx+", sy: "+ alabel.sy+ ", ex: "+ alabel.ex+ ", ey: "+ alabel.ey ; 
        text += ', label: "'+alabel.label+'" },\n';
    }

    text += '];\n\n';

    text += 'export const mapwidth = bgtiles[0][0].length;\n';
    text += 'export const mapheight = bgtiles[0].length;\n';


    UTIL.download(text, CONFIG.SAVEMAPFILENAME, "text/plain");
}


export function generate_level_file() {
    let layer0 = g_ctx.g_layers[0];
    let layer1 = g_ctx.g_layers[1];
    let layer2 = g_ctx.g_layers[2];
    let layer3 = g_ctx.g_layers[3];

    let animated_tiles = [];

    // level0 
    var tile_array0 = Array.from(Array(CONFIG.leveltilewidth), () => new Array(CONFIG.leveltileheight));
    for (let x = 0; x < CONFIG.leveltilewidth; x++) {
        for (let y = 0; y < CONFIG.leveltileheight; y++) {
            tile_array0[x][y] = -1;
        }
    }
    for (var i = 0; i < layer0.container.children.length; i++) {
        var child = layer0.container.children[i];

        // check if it's an animated sprite
        if(child.hasOwnProperty('animationSpeed')){
            child.layer = 0;
            animated_tiles.push(child);
            continue;
        }

        if (!child.hasOwnProperty('index')) {
            continue;
        }
        let x_coord = child.x / g_ctx.tiledimx;
        let y_coord = child.y / g_ctx.tiledimy;

        if (typeof tile_array0[x_coord] == 'undefined'){
            console.log("**Error xcoord undefined ", x_coord);

        }
        else if (typeof tile_array0[x_coord][y_coord] == 'undefined'){
            console.log("**Error xcoord/ycoord undefined ", x_coord, y_coord);
        }else{
            tile_array0[x_coord][y_coord] = child.index;
        }
    }

    // level1 
    var tile_array1 = Array.from(Array(CONFIG.leveltilewidth), () => new Array(CONFIG.leveltileheight));
    for (let x = 0; x < CONFIG.leveltilewidth; x++) {
        for (let y = 0; y < CONFIG.leveltileheight; y++) {
            tile_array1[x][y] = -1;
        }
    }
    for (var i = 0; i < layer1.container.children.length; i++) {
        var child = layer1.container.children[i];

        // check if it's an animated sprite
        if(child.hasOwnProperty('animationSpeed')){
            child.layer = 1;
            animated_tiles.push(child);
            continue;
        }

        if (!child.hasOwnProperty('index')) {
            continue;
        }
        let x_coord = child.x / g_ctx.tiledimx;
        let y_coord = child.y / g_ctx.tiledimy;
        if (typeof tile_array1[x_coord] == 'undefined'){
            console.log("**Error xcoord undefined ", x_coord);

        }
        else if (typeof tile_array1[x_coord][y_coord] == 'undefined'){
            console.log("**Error xcoord/ycoord undefined ", x_coord, y_coord);
        }else{
            tile_array1[x_coord][y_coord] = child.index;
        }
    }

    //  object level
    var tile_array2 = Array.from(Array(CONFIG.leveltilewidth), () => new Array(CONFIG.leveltileheight));
    for (let x = 0; x < CONFIG.leveltilewidth; x++) {
        for (let y = 0; y < CONFIG.leveltileheight; y++) {
            tile_array2[x][y] = -1;
        }
    }
    for (var i = 0; i < layer2.container.children.length; i++) {
        var child = layer2.container.children[i];

        // check if it's an animated sprite
        if(child.hasOwnProperty('animationSpeed')){
            child.layer = 2;
            animated_tiles.push(child);
            continue;

        }

        if (!child.hasOwnProperty('index')) {
            continue;
        }
        let x_coord = child.x / g_ctx.tiledimx;
        let y_coord = child.y / g_ctx.tiledimy;
        if (typeof tile_array2[x_coord] == 'undefined'){
            console.log("**Error xcoord undefined ", x_coord);

        }
        else if (typeof tile_array2[x_coord][y_coord] == 'undefined'){
            console.log("**Error xcoord/ycoord undefined ", x_coord, y_coord);
        }else{
        tile_array2[x_coord][y_coord] = child.index;
        }
    }

    //  object level
    var tile_array3 = Array.from(Array(CONFIG.leveltilewidth), () => new Array(CONFIG.leveltileheight));
    for (let x = 0; x < CONFIG.leveltilewidth; x++) {
        for (let y = 0; y < CONFIG.leveltileheight; y++) {
            tile_array3[x][y] = -1;
        }
    }
    for (var i = 0; i < layer3.container.children.length; i++) {
        var child = layer3.container.children[i];

        // check if it's an animated sprite
        if(child.hasOwnProperty('animationSpeed')){
            child.layer = 3;
            animated_tiles.push(child);
            continue;

        }

        if (!child.hasOwnProperty('index')) {
            continue;
        }
        let x_coord = child.x / g_ctx.tiledimx;
        let y_coord = child.y / g_ctx.tiledimy;
        if (typeof tile_array3[x_coord] == 'undefined'){
            console.log("**Error xcoord undefined ", x_coord);

        }
        else if (typeof tile_array3[x_coord][y_coord] == 'undefined'){
            console.log("**Error xcoord/ycoord undefined ", x_coord, y_coord);
        }else{
        tile_array3[x_coord][y_coord] = child.index;
        }
    }


    write_map_file(tile_array0, tile_array1, tile_array2, tile_array3, animated_tiles);
}