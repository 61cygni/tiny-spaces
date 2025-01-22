import * as SPACED from '@spaced/mainloop.js';
import * as BEING from '@spaced/being.js';

import * as PENTA from './pentacity.js';

// Pixi init
SPACED.initApp(2200, 1600, 'spacecanvas');

let mainchar = BEING.NoBeing();

const levels = [
    PENTA.Instance,
];

await SPACED.initAndLoadLevels(mainchar, levels);
SPACED.initMainLoop("Penta-start1");