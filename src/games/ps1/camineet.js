// -----
// To add a prompt:
//  
// https://www.braintrust.dev/app/casado/p/spaces/prompts
//
// Music:
// https://www.zophar.net/music/sega-master-system-vgm/phantasy-star
//
// -----
import * as BT     from '@spaced/bt.js';
import * as LEVEL  from '@spaced/level.js';
import * as GAME   from '@spaced/gameevents.js';
import * as SCENE  from '@spaced/scene.js';

import * as ALIS  from './alis.js';

import { sound } from '@pixi/sound';

const MAPFILE = "../games/ps1/maps/ps1-camineet.js";


// Return static image object used by level.js to load images, size them, and create PIXI sprites from them 
function static_images(){
    // all static images to load;
    let static_img = [];

    static_img.push(new LEVEL.StaticImage("bg",      "./img/camineet-house-bg.png",   640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("city-bg", "./img/camineet-city-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("armory-bg", "./img/armory-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("food-bg", "./img/food-shop-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("church-bg", "./img/church-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("second-hand-bg", "./img/second-hand-shop-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("vill1",   "./img/villager-1.png", 80, 218, 280,180));
    static_img.push(new LEVEL.StaticImage("vill2",   "./img/villager-2.png", 80, 218, 280,180));
    static_img.push(new LEVEL.StaticImage("vill3",   "./img/villager-3.png", 80, 218, 280,180));
    static_img.push(new LEVEL.StaticImage("vill1-half",   "./img/villager-1-half.png", 80, 118, 280,203));
    static_img.push(new LEVEL.StaticImage("vill3-half",   "./img/villager-3-half.png", 80, 118, 280,203));
    static_img.push(new LEVEL.StaticImage("vill5-half",   "./img/camineet-villager-5-half.png", 80, 118, 280,203));
    static_img.push(new LEVEL.StaticImage("priest-half",   "./img/camineet-priest-half.png", 80, 118, 280,203));
    static_img.push(new LEVEL.StaticImage("vill4",   "./img/villager-4.png", 80, 218, 280,180));
    static_img.push(new LEVEL.StaticImage("guard1",   "./img/guard-1.png", 80, 218, 280,180));

    return static_img;
}

var oneShotInit = (function() {
    var executed = false;
    return function() {
        if (!executed) {
            executed = true;

            // Sound for camineet
            sound.add('ps1-town', './audio/ps1-town.mp3');
            sound.add('ps1-camineet-shop', './audio/ps1-shop.mp3');
            sound.add('ps1-camineet-church', './audio/ps1-camineet-church.mp3');

            sound.volumeAll = 0.05;

            // sound.toggleMuteAll();
        }
    };
})();

var oneShotIntroBlurb = (function(ge) {
    var executed = false;
    return async function(ge) {
        if (!executed) {
            executed = true;
            let str = "This is Camineet. Alice's hometown on planet Palma." +
                "Alice just witness the death of her brother nero." +
                "The planet is under seige by Lassic." +
                "Alice is determined to break Lassic's control" +
                "on Palma and the rest of the Algol planets." +
                "And she will exact revenge on Lassic and his" +
                "men for killing her brother.";


            //const astr = BT.asyncbt("intro-blurb-a6a7", "");
            // ge.dialog_now(astr);
            let result = await BT.asyncbtStream("intro-blurb-a6a7", "");
            for await (const chunk of result) {
                ge.dialog_stream(chunk.data, 'bottom', null, true);
            }
            ge.dialog_stream_done();

        }
    };
})();

function init(gameevents) {

    oneShotInit();

    SCENE.setbgmusic('ps1-town');

    let house2 = new House2(gameevents);
    let house1 = new House1(gameevents);
    let house3 = new House3(gameevents);
    let house4 = new House4(gameevents);
    let house5 = new House5(gameevents);
    let man1 = new Man1(gameevents);
    let man2 = new Man2(gameevents);
    let man3 = new Man3(gameevents);
    let man4 = new Man4(gameevents);
    let guard1 = new Guard1(gameevents);
    let shop1  = new Shop1(gameevents);
    let shop2  = new Shop2(gameevents);
    let shop3  = new Shop3(gameevents);
    let church1  = new Church1(gameevents);

    let alis_ai = new AlisAI(gameevents);

    // set up static background handlers for houses, NPCs
    gameevents.register_label_handler("house2", new GAME.StaticBackground(house2, gameevents, 31 * 16, (9 * 16) + 1));
    gameevents.register_label_handler("house1", new GAME.StaticBackground(house1, gameevents, 11 * 16, (8 * 16) + 1));
    gameevents.register_label_handler("house3", new GAME.StaticBackground(house3, gameevents, 28 * 16, (14 * 16) + 1));
    gameevents.register_label_handler("house4", new GAME.StaticBackground(house4, gameevents, 25 * 16, (24 * 16) + 1));
    gameevents.register_label_handler("house5", new GAME.StaticBackground(house5, gameevents, 14 * 16, (17 * 16) + 1));
    gameevents.register_label_handler("man1", new GAME.StaticBackground(man1, gameevents, (22 * 16), (6 * 16)));
    gameevents.register_label_handler("man2", new GAME.StaticBackground(man2, gameevents, (19 * 16) + 1, (14 * 16)));
    gameevents.register_label_handler("man3", new GAME.StaticBackground(man3, gameevents, (12 * 16) + 1, (19 * 16)));
    gameevents.register_label_handler("man4", new GAME.StaticBackground(man4, gameevents, (20 * 16) + 1, (19 * 16)));
    gameevents.register_label_handler("guard1", new GAME.StaticBackground(guard1, gameevents, (9 * 16), (16 * 16)));
    gameevents.register_label_handler("shop1", new GAME.StaticBackground(shop1, gameevents, (20 * 16), (17 * 16)));
    gameevents.register_label_handler("shop2", new GAME.StaticBackground(shop2, gameevents, (23 * 16), (17 * 16)));
    gameevents.register_label_handler("shop3", new GAME.StaticBackground(shop3, gameevents, (25 * 16), (17 * 16)));
    gameevents.register_label_handler("church1", new GAME.StaticBackground(church1, gameevents, (33 * 16), (22 * 16)));

    // on esc go to AI view
    gameevents.register_esc_handler(new GAME.StaticBackground(alis_ai, gameevents));

    // on exit, go to Palma overworld
    gameevents.register_label_handler("exit1", new GAME.ChangeLevel("Palma-start1", gameevents)); 

    // Intro blurb
    // Keeping this around as an example. But it's currently been replaced with a proper intro.
    // oneShotIntroBlurb(gameevents);

} // init


class House1 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            { bg: "bg", 
              slug: "camineet-house-1-0da4", 
              character: "vill1",
               orig_dialog:  "I'M NEKISE. ONE HEARS LOTS OF STORIES, YOU KNOW, BUT SOME SAY THAT A FIGHTER NAMED ODIN LIVES IN A TOWN CALLED SCION. ALSO, I HAVE A LACONION POT GIVEN BY NERO. THAT WOULD BE HELPFUL IN YOUR TASK."
            });
    }
};

class House2 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            { bg: "bg", 
              slug: "alice-home-9fee",
              orig_dialog:  "HERE IS THE HOME OF ALICE."
            });
    }
};

class House3 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg:"bg", 
                name: "Suelo",
                slug: "camineet-house-3-intro-4857", 
                slug2: "camineet-house3-6471", 
                character: "vill2", 
                chat: true,
                orig_dialog: "I'M SUELO. I KNOW HOW YOU MUST FEEL, DEAR, NO ONE CAN STOP YOU FROM DOING WHAT YOU KNOW YOU MUST DO. BUT IF YOU SHOULD EVER BE WOUNDED IN BATTLE, COME HERE TO REST."
            });
    }
};

class House4 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "bg", 
                character: "vill1",
                orig_dialog: "YOU NEED A DUNGEON KEY TO OPEN LOCKED DOORS"
            });
    }
};

class House5 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "bg", 
                slug: "camineet-house-5-intro-3bd5", 
                slug2: "camineet-house-5-c9f7", 
                character: "vill4", 
                chat: true,
                orig_dialog:  "DO YOU KNOW ABOUT THE PLANETS OF THE ALGOL STAR SYSTEM?"
            });
    }
};

class Man1 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg:"city-bg", 
                character: "vill3", 
                chat: true,
                orig_dialog: "IN SOME DUNGEONS YOU WONT GET FAR WITHOUT A LIGHT"
            });
    }
};

class Man2 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "city-bg", 
                slug: "camineet-man-2-dcdf", 
                character: "vill3",
                orig_dialog:  "THERE IS A SPACEPORT TO THE WEST OF CAMINEET"
            });
    }
};

class Man3 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents,
            {
                bg: "city-bg",
                character: "vill3",
                chat: true,
                orig_dialog: "IF YOU WANT TO MAKE A DEAL. YOU WANT TO HEAD TO THE PORT TOWN."
            });
    }
};

class Man4 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents,
            {
                bg: "city-bg",
                character: "vill3",
                chat: true,
                orig_dialog: "THE CAMINEET RESIDENTIAL AREA IS UNDER MARTIAL LAW."
            });
    }
};

class Guard1 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents,
            {
                bg: "city-bg",
                character: "guard1",
                orig_dialog:  "YOU MAY NOT PASS."
            });
    }
};

class Shop1 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "armory-bg", 
                slug: "camineet-shop-1-intro-fbe9", 
                slug2: "camineet-shop-1-15e3", 
                character: "vill3-half", 
                chat: true,
                orig_dialog: "GUARDS SELL BETTER SHIT.",
                music: "ps1-camineet-shop",
                basemusic: "ps1-town"
            });
    }
};

class Shop2 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents,
            {
                bg: "food-bg",
                character: "vill5-half",
                orig_dialog: "Buy giblits!.",
                music: "ps1-camineet-shop",
                basemusic: "ps1-town"
            });
    }
};

class Shop3 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "second-hand-bg",  
                character: "vill1-half",
                orig_dialog: "Buy crap!",
                music: "ps1-camineet-shop",
                basemusic: "ps1-town"
            });
    }
};

class Church1 extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "church-bg", 
                character: "priest-half",
                orig_dialog: "Save your soul!",
                music: "ps1-camineet-church",
                basemusic: "ps1-town"
            });
    }
};

class AlisAI extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg:"city-bg", 
                name: "AI",
                slug: "alisai-44a9",
                chat: true,
                orig_dialog: "CHECK YOUR ITEMS AND SHIT"
            });
    }

    user_input(){
        let alis = ALIS.rawInstance();
        console.log(alis);
        console.log("HEALTH "+alis.health);
        let lac = {
            name: "laconion pot"
        };
        let sword = {
            name: "rusty sword",
        };
        alis.items.push(lac)
        alis.items.push(sword);
        return {
            health: alis.health,
            level: alis.explevel,
            items: alis.items,
        };
    }
    
};

class Camineet extends LEVEL.Level {
    constructor(){
        super("Camineet");
    }

    mapfile() {
        return MAPFILE;
    }

    static_images(){
        return static_images();
    }

    initonce(){
    }

    initonenter(ge){
        return init(ge);
    }
}

export var Instance = new Camineet();