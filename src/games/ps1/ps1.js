// Phantasy Star 1
//
// This is a simple, partial port of the original game to spaced 
//
// The original game is copyrighted by Sega, and is used here for educational purposes only
//
// You can play the original game here: https://www.retrogames.cz/play_191-SegaMS.php


import * as PIXI from 'pixi.js'

import * as SPACED from '@spaced/mainloop.js';

import * as ALIS  from './alis.js';
import * as TITLE from './title.js';
import * as CAM   from './camineet.js';
import * as PALMA from './palma.js';

// Pixi init
const app = new PIXI.Application();
app.init({ width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

// Alis  (main character)
let Alis = await ALIS.getInstance(app); 

// Level-Label to start the game on 
//const startlocation = "Camineet-start1";
//const startlocation = "Title-start1";
const startlocation = "Palma-start1";

//  all levels to preload
const levels = [
    TITLE.Instance,
    CAM.Instance,
    PALMA.Instance,
];

await SPACED.initAndLoadLevels(app, Alis, levels);
SPACED.initMainLoop(startlocation);