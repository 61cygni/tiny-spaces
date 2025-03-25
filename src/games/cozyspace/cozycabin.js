import * as LEVEL  from '@spaced/level.js';
import * as SCENE  from '@spaced/scene.js';
import * as GAMEEVENTS  from '@spaced/gameevents.js';

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
                        new LEVEL.Sprite('cozyclock', './spritesheets/cozyclock0.json'),
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
        let closest = this.gameevents.level.get_closest_thing(this.impl.gameevents.mainchar, 100);
        if (!closest) {
            console.log("No closest thing");
            return;
        }


        if (closest instanceof COZYTHINGS.Fireplace) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.GrandfatherClock) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.SoupPot) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.CozyDoor) {
            if (!closest.isOpen()) {
                closest.open();
            } else {
                closest.close();
            }
        }else if (closest instanceof COZYTHINGS.WritingDesk) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.KitchenStool) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.CuttingStool) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.SleepingDogChair) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.WindChair) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.Phonograph) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.EntranceChair) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.CatChair) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.PhonographChair) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.BookChair) {
            closest.onEnter();
        }else if (closest instanceof COZYTHINGS.ChildBed) {
            closest.onEnter();
        }else{
            console.log("No interaction handler found for closest thing");
            console.log(closest);
        }
    }

    tick(){
        this.finished = true;
    }


    finalize(){
        this.gameevents.register_key_handler("Enter", new EnterInteractionHandler(this.impl));
    }
    
}

class MuteHandler extends GAMEEVENTS.RawHandler {
    constructor(impl){
        super(impl.gameevents);
        this.impl = impl;
    }

    init() {
        if (sound.find('cozy').isPlaying) {
            sound.find('cozy').pause();
        } else {
            sound.find('cozy').play();
        }
    }

    finalize(){
        this.impl.gameevents.register_key_handler("KeyM", new MuteHandler(this.impl));
    }
}



class CozyCabinImpl {
    constructor(gameevents){
        this.gameevents = gameevents;
    }

    init(gameevents){

        // whenever player presses enter, find if there is something close to interact with 
        this.gameevents.register_key_handler("Enter", new EnterInteractionHandler(this));
        this.gameevents.register_key_handler("KeyM", new MuteHandler(this));


        SCENE.setbgmusic('cozy');

        let writinglist = [];
        let kitchenstoollist = [];
        let cuttingstoollist = [];
        let sleepingdogchairlist = [];
        let windchairlist = [];
        let entrancechairlist = [];
        let catchairlist = [];
        let phonographchairlist = [];
        let bookchairlist = [];
        let childbedlist = [];

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
                    writinglist.push(fireplace);
                }
                else if(spr.y == 360){
                    sleepingdogchairlist.push(fireplace);
                }
                if(spr.x == 144){
                    entrancechairlist.push(fireplace);
                }
                if(spr.x == 1176){
                    catchairlist.push(fireplace);
                }
                if(spr.x == 1728 && spr.y == 1152){
                    phonographchairlist.push(fireplace);
                }
                if(spr.x == 864){
                    bookchairlist.push(fireplace);
                }
                if(spr.x == 72){
                    childbedlist.push(fireplace);
                }
            }else if(spr.sheet.includes('cozy-clock0.json')){
                let grandfatherClock = new COZYTHINGS.GrandfatherClock(this.gameevents);
                grandfatherClock.arrive(spr.x, spr.y);
                this.gameevents.level.addThing(grandfatherClock);

                if(spr.x == 1560){
                    writinglist.push(grandfatherClock);
                }
                if(spr.x == 120){
                    entrancechairlist.push(grandfatherClock);
                }
            }else if(spr.sheet.includes('cozy-firepot.json')){
                let soupPot = new COZYTHINGS.SoupPot(this.gameevents);
                soupPot.arrive(spr.x, spr.y);
                this.gameevents.level.addThing(soupPot);

                if(spr.x == 192){
                    kitchenstoollist.push(soupPot);
                    cuttingstoollist.push(soupPot);
                }
            }else if(spr.sheet.includes('cozy-door.json')){
                let door = new COZYTHINGS.CozyDoor(this.gameevents);
                door.arrive(spr.x, spr.y);
                this.gameevents.level.addThing(door);
            }else if(spr.sheet.includes('phono0.json')){
                let phonograph = new COZYTHINGS.Phonograph(this.gameevents);
                phonograph.setCenter(spr.x+48, spr.y+48);
                this.gameevents.level.addThing(phonograph);
            }
        } // end of loop through all animated sprites

        // loop through all labels and add things to the level
        for(let i in this.gameevents.level.maplabels){
            let label = this.gameevents.level.maplabels[i];
            if(label.label == 'writingdesk'){
                let writingDesk = new COZYTHINGS.WritingDesk(label,this.gameevents);
                writingDesk.addThingList(writinglist);
                this.gameevents.level.addThing(writingDesk);
            }else if(label.label == "kitchenstool"){
                let kitchenstool = new COZYTHINGS.KitchenStool(label,this.gameevents);
                kitchenstool.addThingList(kitchenstoollist);
                this.gameevents.level.addThing(kitchenstool);
            }else if(label.label == "cuttingstool"){
                let cuttingstool = new COZYTHINGS.CuttingStool(label,this.gameevents);
                cuttingstool.addThingList(cuttingstoollist);
                this.gameevents.level.addThing(cuttingstool);
            }else if(label.label == "sleepingdogchair"){
                let sleepingdogchair = new COZYTHINGS.SleepingDogChair(label,this.gameevents);
                sleepingdogchair.addThingList(sleepingdogchairlist);
                this.gameevents.level.addThing(sleepingdogchair);
            }else if(label.label == "windchair"){
                let windchair = new COZYTHINGS.WindChair(label,this.gameevents);
                windchair.addThingList(windchairlist);
                this.gameevents.level.addThing(windchair);
            }else if(label.label == "catchair"){
                let catchair = new COZYTHINGS.CatChair(label,this.gameevents);
                catchair.addThingList(catchairlist);
                this.gameevents.level.addThing(catchair);
            }else if(label.label == "entrancechair"){
                let entrancechair = new COZYTHINGS.EntranceChair(label,this.gameevents);
                entrancechair.addThingList(entrancechairlist);
                this.gameevents.level.addThing(entrancechair);
            }else if(label.label == "phonographchair"){
                let phonographchair = new COZYTHINGS.PhonographChair(label,this.gameevents);
                phonographchair.addThingList(phonographchairlist);
                this.gameevents.level.addThing(phonographchair);
            }else if(label.label == "bookchair"){
                let bookchair = new COZYTHINGS.BookChair(label,this.gameevents);
                bookchair.addThingList(bookchairlist);
                this.gameevents.level.addThing(bookchair);
            }else if(label.label == "childbed"){
                let childbed = new COZYTHINGS.ChildBed(label,this.gameevents);
                childbed.addThingList(childbedlist);
                this.gameevents.level.addThing(childbed);
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