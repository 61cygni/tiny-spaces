// -----
// To add a prompt:
//  
// https://www.braintrust.dev/app/casado/p/spaces/prompts
//
// Music:
// https://www.zophar.net/music/sega-master-system-vgm/phantasy-star
//
// -----
import * as BT  from './bt.js';
import * as LEVEL  from './level.js';
import * as GAME   from './gameevents.js';

import { sound } from '@pixi/sound';

export const MAPFILE = "../maps/ps1-camineet.js";

// Helper function to change music
function setbgmusic(newsong){
        sound.stopAll();
        sound.play(newsong, {loop: true});
}

// Return static image object used by level.js to load images, size them, and create PIXI sprites from them 
export function static_images(){
    // all static images to load;
    let static_img = [];

    static_img.push(new LEVEL.StaticImage("bg",      "./ps1/camineet-house-bg.png",   640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("city-bg", "./ps1/camineet-city-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("armory-bg", "./ps1/armory-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("food-bg", "./ps1/food-shop-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("church-bg", "./ps1/church-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("second-hand-bg", "./ps1/second-hand-shop-bg.png", 640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("vill1",   "./ps1/villager-1.png", 80, 218, 280,180));
    static_img.push(new LEVEL.StaticImage("vill2",   "./ps1/villager-2.png", 80, 218, 280,180));
    static_img.push(new LEVEL.StaticImage("vill3",   "./ps1/villager-3.png", 80, 218, 280,180));
    static_img.push(new LEVEL.StaticImage("vill1-half",   "./ps1/villager-1-half.png", 80, 118, 280,203));
    static_img.push(new LEVEL.StaticImage("vill3-half",   "./ps1/villager-3-half.png", 80, 118, 280,203));
    static_img.push(new LEVEL.StaticImage("vill5-half",   "./ps1/camineet-villager-5-half.png", 80, 118, 280,203));
    static_img.push(new LEVEL.StaticImage("priest-half",   "./ps1/camineet-priest-half.png", 80, 118, 280,203));
    static_img.push(new LEVEL.StaticImage("vill4",   "./ps1/villager-4.png", 80, 218, 280,180));
    static_img.push(new LEVEL.StaticImage("guard1",   "./ps1/guard-1.png", 80, 218, 280,180));

    return static_img;
}

export function init(gameevents) {

    // Sound for camineet
    sound.add('ps1-town', '../music/ps1-town.mp3');
    sound.add('ps1-camineet-shop', './ps1/ps1-shop.mp3');
    sound.add('ps1-camineet-church', './ps1/ps1-camineet-church.mp3');

    sound.volumeAll = 0.05;
    sound.play('ps1-town', {loop: true });

    sound.toggleMuteAll();

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

    gameevents.register_esc_handler(new GAME.StaticBackground(alis_ai, gameevents));

    // Intro blurb

    let str = "This is Camineet. Alice's hometown on planet Palma." +
        "Alice just witness the death of her brother nero." +
        "The planet is under seige by Lassic." +
        "Alice is determined to break Lassic's control" +
        "on Palma and the rest of the Algol planets." +
        "And she will exact revenge on Lassic and his" +
        "men for killing her brother.";


    const astr = BT.asyncbt("intro-blurb-a6a7", "");
    gameevents.dialog_now(str);

} // init

// CamineetSceneOptions
//
// {
// bg   :   "background image",
// slug :   "intro prompt slug",
// slug2 : "conversation prompt slug",
// music : "music to play during scene",
// character : "name of character for scene,
// chat : bool, // add a chat input
// orig_dialog = "original game dialog" 
// }
//


class CamineetScene {

    //constructor(gevents, bg, slug, slug2 = "", character = null, chat = false) {
    constructor(gevents, options) {
        this.gevents = gevents;
        if(!Object.hasOwn(options,'bg')){
            console.log("ERR: CamineetScene:error options needs to specify bg")
            return;
        }
        this.bg = gevents.level.static_assets.get(options.bg); 

        this.name = "Villager";
        if(Object.hasOwn(options,'name')){
            this.name = options.name;
        }

        this.slug = "";
        if(Object.hasOwn(options,'slug')){
            this.slug = options.slug;
        }
        this.slug2 = ""; // Prompt during chat (doesn't include intro)
        if(Object.hasOwn(options,'slug2')){
            this.slug2 = options.slug2;
        }
        this.character = null;
        if(Object.hasOwn(options,'character')){
            this.character = gevents.level.static_assets.get(options.character);
        }
        this.chat = false;
        if(Object.hasOwn(options,'chat')){
            this.chat = options.chat; // whether you can chat with this character
        }

        this.orig_dialog = "";
        if(Object.hasOwn(options,'orig_dialog')){
            this.orig_dialog = options.orig_dialog; // original game dialog 
        }

        this.music = null
        if(Object.hasOwn(options,'music')){
            this.music = options.music; // original game dialog 
        }

        this.visits = 0;
        this.finished = false;

    } // constructor

    // after first dialog, create input
    dialogdone() {
    }

    // once user has entered text, call prompt
    inputcallme(val){
        if(this.slug2 != ""){
            BT.bt(this.slug2, val, this.visits, this.dodialog.bind(this, val));
        } else {
            BT.bt(this.slug, val, this.visits, this.dodialog.bind(this, val));
        }
    }
    // dialog whilechatting
    dodialog(user, val) {
        if (!this.finished) {
            let str = "You: "+user+"\n"+this.name+": "+val;
            this.gevents.dialog_now(str, "inputbottom", null, true);
        }
    }

    firstpromptdone(val) {
        if (!this.finished) {
            this.gevents.dialog_now(this.name +": "+val, "inputbottom", this.dialogdone.bind(this), true);
        }
        if (!this.finished && this.chat) {
            this.gevents.input_now("", this.inputcallme.bind(this));
        }
    }

    // Called each time house is entered
    init() {
        this.visits += 1;
        this.finished = false;
        this.gevents.esc = false; // clean just in case. 
        if(this.music){
            setbgmusic(this.music);
        }
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        if(this.character){
            this.gevents.level.app.stage.addChild(this.character);
        }
        if(this.slug == ""){
            this.gevents.dialog_now(this.orig_dialog);
        }
        else { 
            BT.bt(this.slug, "", this.visits, this.firstpromptdone.bind(this));
        }
    }

    // Tick called until scene is done.
    // Ret false = finished
    // Exit on ESC keypress
    tick() {
        if (this.gevents.esc) {
            // 
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        return true;
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        if (this.chat) {
            this.gevents.input_leave();
        }
        this.gevents.level.app.stage.removeChild(this.bg);
        if(this.character){
            this.gevents.level.app.stage.removeChild(this.character);
        }
        if(this.music){
            setbgmusic('ps1-town');
        }
    }

}; // class Camineet house 

export class House1 extends CamineetScene {
    constructor(gevents) {
        super(gevents, 
            { bg: "bg", 
              slug: "camineet-house-1-0da4", 
              character: "vill1",
               orig_dialog:  "I'M NEKISE. ONE HEARS LOTS OF STORIES, YOU KNOW, BUT SOME SAY THAT A FIGHTER NAMED ODIN LIVES IN A TOWN CALLED SCION. ALSO, I HAVE A LACONION POT GIVEN BY NERO. THAT WOULD BE HELPFUL IN YOUR TASK."
            });
    }
};

export class House2 extends CamineetScene {
    constructor(gevents) {
        super(gevents, 
            { bg: "bg", 
              slug: "alice-home-9fee",
              orig_dialog:  "HERE IS THE HOME OF ALICE."
            });
    }
};

export class House3 extends CamineetScene {
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

export class House4 extends CamineetScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "bg", 
                character: "vill1",
                orig_dialog: "YOU NEED A DUNGEON KEY TO OPEN LOCKED DOORS"
            });
    }
};

export class House5 extends CamineetScene {
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

export class Man1 extends CamineetScene {
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

export class Man2 extends CamineetScene {
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

export class Man3 extends CamineetScene {
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

export class Man4 extends CamineetScene {
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

export class Guard1 extends CamineetScene {
    constructor(gevents) {
        super(gevents,
            {
                bg: "city-bg",
                character: "guard1",
                orig_dialog:  "YOU MAY NOT PASS."
            });
    }
};

export class Shop1 extends CamineetScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "armory-bg", 
                slug: "camineet-shop-1-intro-fbe9", 
                slug2: "camineet-shop-1-15e3", 
                character: "vill3-half", 
                chat: true,
                orig_dialog: "GUARDS SELL BETTER SHIT.",
                music: "ps1-camineet-shop"
            });
    }
};

export class Shop2 extends CamineetScene {
    constructor(gevents) {
        super(gevents,
            {
                bg: "food-bg",
                character: "vill5-half",
                orig_dialog: "Buy giblits!.",
                music: "ps1-camineet-shop"
            });
    }
};

export class Shop3 extends CamineetScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "second-hand-bg",  
                character: "vill1-half",
                orig_dialog: "Buy crap!",
               music: "ps1-camineet-shop"
            });
    }
};

export class Church1 extends CamineetScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg: "church-bg", 
                character: "priest-half",
                orig_dialog: "Save your soul!",
                music: "ps1-camineet-church"
            });
    }
};

export class AlisAI extends CamineetScene {
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
};


