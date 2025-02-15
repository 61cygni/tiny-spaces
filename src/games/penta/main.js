import { Assets } from 'pixi.js';

import * as SPACED from '@spaced/mainloop.js';
import * as SCREEN from '@spaced/screen.js';
import * as STRANGER from './stranger.js';

import * as PENTA from './pentacity.js';

// Pixi init
SPACED.initApp(2496, 2000, 'spacecanvas');

const sheet = await Assets.load("./spritesheets/villagers.json");

let mainchar = new STRANGER.Stranger(sheet, SCREEN.instance().app);
mainchar.setFocus(true);

const levels = [
    PENTA.Instance,
];

await SPACED.initAndLoadLevels(mainchar, levels);
SPACED.initMainLoop("Penta-start1");