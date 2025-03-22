// Phantasy Star 1
//
// This is a simple, partial port of the original game to spaced 
//
// The original game is copyrighted by Sega, and is used here for educational purposes only
//
// You can play the original game here: https://www.retrogames.cz/play_191-SegaMS.php


import * as SPACED from '@spaced/mainloop.js';
import * as BT from '@spaced/bt.js';

import * as ALIS  from './alis.js';
import * as TITLE from './title.js';
import * as CAM   from './camineet.js';
import * as PALMA from './palma.js';

await BT.initBT("spaces");

// Pixi init
SPACED.initApp(640, 480, 'spacecanvas');

// Alis  (main character)
let Alis = await ALIS.getInstance(); 

// Level-Label to start the game on 
//const startlocation = "Title-start1";
//const startlocation = "Camineet-start1";
const startlocation = "Palma-start1";

//  all levels to preload
const levels = [
    TITLE.Instance,
    CAM.Instance,
    PALMA.Instance,
];

await SPACED.initAndLoadLevels(Alis, levels);
SPACED.initMainLoop(startlocation);