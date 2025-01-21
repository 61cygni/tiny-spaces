import * as SPACED from '@spaced/mainloop.js';
import * as BEING from '@spaced/being.js';

import * as MAGE from './magecity.js';

// Pixi init
SPACED.initApp(1800, 1600, 'spacecanvas');

let mainchar = BEING.NoBeing();

const levels = [
    MAGE.Instance,
];

await SPACED.initAndLoadLevels(mainchar, levels);
SPACED.initMainLoop("Mage-start1");