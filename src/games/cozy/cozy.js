import * as SPACED from '@spaced/mainloop.js';
import * as BEING from '@spaced/being.js';

import * as COZY from './cozycabin.js';

// Pixi init
SPACED.initApp(2400, 1600, 'spacecanvas');

let mainchar = BEING.NoBeing();

const levels = [
    COZY.Instance,
];

await SPACED.initAndLoadLevels(mainchar, levels);
SPACED.initMainLoop("Cozy-start1");