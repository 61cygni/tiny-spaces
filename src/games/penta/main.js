import { Assets } from 'pixi.js';

import * as SPACED from '@spaced/mainloop.js';
import * as SCREEN from '@spaced/screen.js';
import * as STRANGER from './stranger.js';

import * as PENTA from './pentacity.js';

// Pixi init
SPACED.initApp(2496, 2000, 'spacecanvas');

const sheet = await Assets.load("./spritesheets/villagers.json");

let mainchar = new STRANGER.Stranger(sheet, SCREEN.instance().app);
mainchar.addItem("Leather Pouch", "A small, old leather pouch.");
mainchar.addItem("Old Key", "A small, old key.");
mainchar.addItem("Necklace", "A beautiful necklace.");

mainchar.setFocus(true);

const levels = [
    PENTA.Instance,
];

if(window.gameLog){
    window.gameLog.info("Game start : Loading levels and all assets");
}
await SPACED.initAndLoadLevels(mainchar, levels);
SPACED.initMainLoop("Penta-start1");