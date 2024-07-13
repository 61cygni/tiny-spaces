import * as CONFIG from './seconfig.js' 
import * as UTIL from './eutils.js'
import { g_ctx }  from './secontext.js' // global context


function generate_preamble() {
    const preamble = '' +
        '{"frames": {\n' +
        '\n';
       return preamble; 
}

// Function to download data to a file
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

export function generate_sprite_file(curlayer, pngfilename, jsonfilename, total_rows = 0) {

    if (g_ctx.debug_flag) {
        console.log("generate_sprite_file");
    }

    let animations = Array.from(Array(CONFIG.leveltileheight), () => new Array().fill(null)); 

    let text = generate_preamble();

    for (let row = 0; row < CONFIG.leveltileheight; row++) {
        if (!curlayer.tilearray[row].hasOwnProperty('as')) {
            continue;
        }
        for (let col = 0; col < curlayer.tilearray[row].as.textures.length; col++) {
            let x = col * g_ctx.leveldimx;
            let y = total_rows * g_ctx.leveldimy;

            let framename = '"tile' + total_rows + "_" + col + '"';
            animations[row].push(framename);
            let frame = curlayer.tilearray[row].as.textures[col];
            text += framename + ": { \n";
            text += '\t"frame": {';
            text += '"x": '+ x + ', "y": '+ y+ ', "w": '+ g_ctx.leveldimx+ ', "h": '+ g_ctx.leveldimy+ ' },\n';
            text += '\t"rotated": false,\n';
            text += '\t"trimmed": true,\n';
            text += '\t"spriteSourceSize": {';
            text += '"x":0, "y":0, "w": '+ g_ctx.leveldimx+ ', "h": '+ g_ctx.leveldimy+ ' },\n';
            text += '\t"sourceSize": {';
            text += '"w": '+ g_ctx.leveldimx+ ', "h": '+ g_ctx.leveldimy+ ' }\n';
            text += '\t}';
            text += ',\n'
        }
        total_rows++;
    }
    // remove the trailing comma
    text = text.slice(0,-2);
    text += '\n';

    text += '},\n';
    text += '"animations": {\n';

    for (let row = 0; row < CONFIG.leveltileheight; row++) {
        if(animations[row].length == 0) {
            continue;
        }
        text += '"row'+row+'" : [';
        for (let x = 0; x < animations[row].length; x++){
            text += ''+animations[row][x];
            if (x < animations[row].length - 1){
                text += ',';
            }
        }
        text += "],\n"
    }

    // remove the trailing comma
    text = text.slice(0,-2);
    text += '\n';


    text += '},\n';
    text += '"meta": {\n';
    text += '\t"image": "'+ pngfilename+'",\n'
    text += '\t"format": "RGBA8888",\n';
    text += '\t"scale": "1"\n';
    text += '}\n';
    text += '}\n';

    console.log("spritefile: saving to file ",jsonfilename);
    UTIL.download(text, jsonfilename, "text/plain");
    return total_rows;
}