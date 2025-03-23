import * as LEVEL  from '@spaced/level.js';
import * as SCENE  from '@spaced/scene.js';
import * as THING  from '@spaced/thing.js';

import { sound } from '@pixi/sound';

const MAPFILE = import.meta.env.DEV
  ? '../games/cozyspace/maps/cozycabin.js'  // Dev path
  : '/maps/cozycabin.js';  // Production path


let impl = null; // singleton for level implementation

class GrandfatherClock extends THING.Thing {
    constructor(gameevents){
        super("grandfather-clock", null, gameevents.level);
    }
    
    listen(){
        sound.play('grandfather-clock');
    }
    
}

class SoupPot extends THING.Thing {
    constructor(gameevents){
        super("soup-pot", gameevents.level.spritesheet_map.get("soup-pot"), gameevents.level);

        this.registerSprite('unlit', 'row0');
        this.registerSprite('lit', 'row1');
        this.setSprite('unlit');

        this.lit = false;
    }

    isLit(){
        return this.lit;
    }
    
    listen(){
        sound.play('soup-pot');
    }

    light(){
        this.lit = true;
        this.setSprite('lit');
        sound.play('light-fire');
        this.startAnim();      
    }
    
}

class Fireplace extends THING.Thing {

    constructor(gameevents){
        super("fireplace", gameevents.level.spritesheet_map.get("fireplace"), gameevents.level);

        this.registerSprite('unlit', 'row0');
        this.registerSprite('lit', 'row1');
        this.setSprite('unlit');

        this.lit = false;
    }

    isLit(){
        return this.lit;
    }

    light(){
        this.lit = true;
        this.setSprite('lit');
        sound.play('light-fire');
        this.startAnim();      
    }

    listen(){
        sound.play('listen-fire');
    }
}


// Return static image object used by level.js to load images, size them, and create PIXI sprites from them 
function static_images(){
    // all static images to load;
    let static_img = [];

    return static_img;
}

function spritesheets(){
    let spritesheets = [new LEVEL.Sprite('fireplace', './spritesheets/cozy-fireplace.json'),
                        new LEVEL.Sprite('soup-pot', './spritesheets/cozy-souppot.json'),
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

        if (closest instanceof Fireplace) {
            if (!closest.isLit()) {
                closest.light();
            } else {
                closest.listen();
            }
        }else if (closest instanceof GrandfatherClock) {
            closest.listen();
        }else if (closest instanceof SoupPot) {
            if (closest.isLit()) {
                closest.listen();
            } else {
                closest.light();
            }
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

        // loop through all animated sprites and set them to lit
        for(let i in this.gameevents.level.animatedsprites){
            let spr = this.gameevents.level.animatedsprites[i];
            // see if the name cozy-fire.json is in the sheet name
            if(spr.sheet.includes('cozy-fire.json')){
                let fireplace = new Fireplace(this.gameevents);
                fireplace.arrive(spr.x, spr.y);
                this.gameevents.level.addThing(fireplace);
            }else if(spr.sheet.includes('cozy-clock0.json')){
                let grandfatherClock = new GrandfatherClock(this.gameevents);
                grandfatherClock.setLocation(spr.x, spr.y);
                this.gameevents.level.addThing(grandfatherClock);
            }else if(spr.sheet.includes('cozy-firepot.json')){
                let soupPot = new SoupPot(this.gameevents);
                soupPot.arrive(spr.x, spr.y);
                this.gameevents.level.addThing(soupPot);
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
        sound.add('light-fire', './audio/lighting-a-fire.mp3');
        sound.add('listen-fire', './audio/camp-fire.mp3');
        sound.add('grandfather-clock', './audio/grandfather-clock.mp3');
        sound.add('soup-pot', './audio/souppot.mp3');
        sound.find('cozy').volume = 0.05;
        sound.find('light-fire').volume = 0.2; // louder fire sound
        sound.find('listen-fire').volume = 0.2;
        sound.find('grandfather-clock').volume = 0.2;
        sound.find('soup-pot').volume = 0.3;
    }

    initonenter(ge){
        impl = new CozyCabinImpl(ge);
        return impl.init(ge);
    }
}

export var Instance = new CozyCabin();