import * as LEVEL  from '@spaced/level.js';
import * as SCENE  from '@spaced/scene.js';

import * as COZYTHINGS  from './cozythings.js';

import { sound } from '@pixi/sound';

const MAPFILE = import.meta.env.DEV
  ? '../games/cozyspace/maps/cozycabin.js'  // Dev path
  : '/maps/cozycabin.js';  // Production path


let impl = null; // singleton for level implementation

// Return static image object used by level.js to load images, size them, and create PIXI sprites from them 
function static_images(){
    // all static images to load;
    let static_img = [];

    return static_img;
}

function spritesheets(){
    let spritesheets = [new LEVEL.Sprite('fireplace', './spritesheets/cozy-fireplace.json'),
                        new LEVEL.Sprite('soup-pot', './spritesheets/cozy-souppot.json'),
                        new LEVEL.Sprite('anim-door', './spritesheets/cozydoor0.json'),
    ];

    return spritesheets;
}

class EnterInteractionHandler {

    constructor(impl){
        this.impl = impl;
        this.gameevents = impl.gameevents;
        this.finished = false;
    }

    init(){
        let closest = this.gameevents.level.get_closest_thing(this.impl.gameevents.mainchar, 300);
        if (!closest) {
            console.log("No closest thing");
            return;
        }


        if (closest instanceof COZYTHINGS.Fireplace) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.GrandfatherClock) {
            closest.listen();
        }else if (closest instanceof COZYTHINGS.SoupPot) {
            if (closest.isLit()) {
                closest.listen();
            } else {
                closest.light();
            }
        }else if (closest instanceof COZYTHINGS.CozyDoor) {
            if (!closest.isOpen()) {
                closest.open();
            } else {
                closest.close();
            }
        }else if (closest instanceof COZYTHINGS.WritingDesk) {
            closest.onEnter();
        }
    }

    tick(){
        this.finished = true;
    }


    finalize(){
        this.gameevents.register_key_handler("Enter", new EnterInteractionHandler(this.impl));
    }
    
}


class CozyCabinImpl {
    constructor(gameevents){
        this.gameevents = gameevents;
    }

    init(gameevents){

        // whenever player presses enter, find if there is something close to interact with 
        this.gameevents.register_key_handler("Enter", new EnterInteractionHandler(this));


        SCENE.setbgmusic('cozy');

        let writingfireplace = null

        // loop through all animated sprites and set them to lit
        for(let i in this.gameevents.level.animatedsprites){
            let spr = this.gameevents.level.animatedsprites[i];
            // see if the name cozy-fire.json is in the sheet name
            if(spr.sheet.includes('cozy-fire.json')){
                let fireplace = new COZYTHINGS.Fireplace(this.gameevents);
                fireplace.arrive(spr.x, spr.y);
                this.gameevents.level.addThing(fireplace);

                // This is a big hack since we don't have labels on sprites right now. Can do automatically later.
                if(spr.x == 1776){
                    writingfireplace = fireplace;
                }
            }else if(spr.sheet.includes('cozy-clock0.json')){
                let grandfatherClock = new COZYTHINGS.GrandfatherClock(this.gameevents);
                grandfatherClock.setLocation(spr.x, spr.y);
                this.gameevents.level.addThing(grandfatherClock);
            }else if(spr.sheet.includes('cozy-firepot.json')){
                let soupPot = new COZYTHINGS.SoupPot(this.gameevents);
                soupPot.arrive(spr.x, spr.y);
                this.gameevents.level.addThing(soupPot);
            }else if(spr.sheet.includes('cozy-door.json')){
                let door = new COZYTHINGS.CozyDoor(this.gameevents);
                door.arrive(spr.x, spr.y);
                this.gameevents.level.addThing(door);
            }
        } // end of loop through all animated sprites

        // loop through all labels and add things to the level
        for(let i in this.gameevents.level.maplabels){
            let label = this.gameevents.level.maplabels[i];
            if(label.label == 'writingdesk'){
                let writingDesk = new COZYTHINGS.WritingDesk(label,this.gameevents);
                writingDesk.addThing(writingfireplace);
                this.gameevents.level.addThing(writingDesk);
            }
        }

    }
    
}

class CozyCabin extends LEVEL.Level {
    constructor(){
        super("Cozy");
    }

    mapfile() {
        return MAPFILE;
    }

    static_images(){
        return static_images();
    }

    spritesheets(){
        return spritesheets();
    }

    initonce() {
        sound.add('cozy', './audio/cozy.m4a');
        sound.find('cozy').volume = 0.03;
        COZYTHINGS.initSoundsOnce();
    }

    initonenter(ge){
        impl = new CozyCabinImpl(ge);
        return impl.init(ge);
    }
}

export var Instance = new CozyCabin();