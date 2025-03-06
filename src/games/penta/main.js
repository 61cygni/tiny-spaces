
import * as SPACED from '@spaced/mainloop.js';

import * as PENTA from './pentacity.js';

// Init pixi, use 'spacecanvas' from index.html as game canves and set the size
SPACED.initApp(2496, 2000, 'spacecanvas');

// Initializes stranger and returns singleton
let mainchar = await PENTA.static_init();

const levels = [
    PENTA.Instance,
];

if(window.gameLog){
    window.gameLog.info("Game start : Loading levels and all assets");
}
await SPACED.initAndLoadLevels(mainchar, levels);
SPACED.initMainLoop("Penta-start1");