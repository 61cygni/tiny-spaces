import * as PIXI from 'pixi.js'

import * as GAME   from './gameevents.js';
import * as BATTLE from './battle.js';
import * as SCENE  from './scene.js';
import * as LEVEL  from './level.js';
import * as ALIS  from './alis.js';
import * as BeachBG from './anim-bg.js';
import * as Monsters from './palma-monsters.js';

import { sound } from '@pixi/sound';

const MAPFILE = "../ps1/palma-anim.js";

function static_images(){
    // all static images to load;
    let static_img = [];

    static_img.push(new LEVEL.StaticImage("field-bg",      "./ps1/ps1-palma-field-bg.png",   640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("forest-bg",      "./ps1/ps1-palma-forest-bg.png",   640, 480, 0,0));
    static_img.push(new LEVEL.StaticImage("beach-bg",      "./ps1/beach-bg.png",   640, 480, 0,0));

    BeachBG.load_assets(static_img);
    Monsters.load_assets(static_img);


    return static_img;
}

var oneShotInit = (function() {
    var executed = false;
    return function() {
        if (!executed) {
            executed = true;

            // Sound for camineet
            sound.add('ps1-palma', './ps1/ps1-palma.mp3');
            sound.add('battle', './ps1/battle.mp3');
            sound.add('gameover', './ps1/gameover.mp3');

            sound.volumeAll = 0.05;
            sound.toggleMuteAll();
        }
    };
})();

function init(gameevents) {

    oneShotInit();
    SCENE.setbgmusic('ps1-palma');

    let alis_ai = new AlisAI(gameevents);
    
    // on exit, go to Palma overworld
    gameevents.register_label_handler("camineet", new GAME.ChangeLevel("Camineet-start2", gameevents)); 


    // 10% chance of monster encounter
    let battle = new BATTLE.BattleScene(gameevents);
    gameevents.register_random_handler("palma-monster", () => {return Math.floor(Math.random() * 200) == 0;}, 
                            new GAME.StaticBackground(battle, gameevents));

      // on esc go to AI view
    gameevents.register_esc_handler(new GAME.StaticBackground(alis_ai, gameevents));
} // -- init

class AlisAI extends SCENE.InteractiveScene {
    constructor(gevents) {
        super(gevents, 
            {
                bg:"field-bg", 
                name: "AI",
                slug: "alisai-44a9",
                chat: true,
                orig_dialog: "CHECK YOUR ITEMS AND SHIT"
            });
    }

    user_input(){
        let alis = ALIS.rawInstance();
        console.log(alis);
        if (alis.items.length == 0) {
            let lac = {
                name: "laconion pot"
            };
            let sword = {
                name: "rusty sword",
            };
            alis.items.push(lac)
            alis.items.push(sword);
        }
        return {
            health: alis.health,
            level: alis.explevel,
            items: alis.items,
        };
    }
};


class Palma extends LEVEL.Level {
    constructor(){
        super("Palma");
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

export var Instance = new Palma();