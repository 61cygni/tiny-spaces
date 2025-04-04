import * as THING  from '@spaced/thing.js';

import { sound } from '@pixi/sound';

export function initSoundsOnce() {
    sound.add('sleepingdogchair', './audio/dog-snoring.mp3');
    sound.add('catchair', './audio/cat-purring.mp3');
    sound.add('bookchair', './audio/book.mp3');
    sound.add('windchair', './audio/rain.mp3');
    sound.add('vinyl', './audio/vinyl.mp3');
    sound.add('phonograph', './audio/1920jazz.mp3');
    sound.add('soup-pot', './audio/souppot.mp3');
    sound.add('kitchenstool', './audio/person-eating.mp3');
    sound.add('writingdesk', './audio/writing-desk.mp3');
    sound.add('door-open', './audio/door-open.mp3');
    sound.add('door-close', './audio/door-close.mp3');
    sound.add('grandfather-clock', './audio/grandfather-clock.mp3');
    sound.add('light-fire', './audio/lighting-a-fire.mp3');
    sound.add('listen-fire', './audio/camp-fire.mp3');
    sound.add('ambient-clock', './audio/clock-tick.mp3');
    sound.add('cuttingstool', './audio/cuttingstool.mp3');
    sound.add('entrancechair', './audio/drinking.mp3');
    sound.add('childbed', './audio/lullaby.mp3');
    sound.find('grandfather-clock').volume = 0.2;
    sound.find('soup-pot').volume = 0.3;
    sound.find('light-fire').volume = 0.2;
    sound.find('listen-fire').volume = 0.2;
    sound.find('door-open').volume = 0.2;
    sound.find('door-close').volume = 0.2;
    sound.find('kitchenstool').volume = 0.4;
    sound.find('writingdesk').volume = 0.9;
    sound.find('ambient-clock').volume = 0.1;
    sound.find('cuttingstool').volume = 0.4;
    sound.find('sleepingdogchair').volume = 0.3;
    sound.find('phonograph').volume = 0.02;
    sound.find('vinyl').volume = 0.7;
    sound.find('windchair').volume = 0.5;
    sound.find('entrancechair').volume = 0.5;
    sound.find('catchair').volume = 0.4;
    sound.find('bookchair').volume = 0.4;
    sound.find('childbed').volume = 0.4;
}

export class CozyDoor extends THING.Thing {
    constructor(gameevents){
        super("anim-door", gameevents.level.spritesheet_map.get("anim-door"), gameevents);

        this.registerSprite('closed', 'row0', false);
        this.registerSprite('opening', 'row1', false);
        this.registerSprite('closing', 'row2', false);
        this.registerSprite('open', 'row3', false);
        this.setSprite('closed');

        this.sprites['opening'].onComplete = () => {
            this.setSprite('open');
        }

        this.sprites['closing'].onComplete = () => {
            this.setSprite('closed');
        }
    }

    isOpen(){
        return this.curanimname == 'open';
    }

    arrive(x, y) {
        super.arrive(x, y);
        // remove any blocks
        let sx = Math.floor(this.container.x / this.gameevents.level.tiledimx);
        let sy = Math.floor(this.container.y / this.gameevents.level.tiledimy);
        for (let x = sx; x < sx + 2; x++) {
            for (let y = sy; y < sy + 3; y++) {
                this.gameevents.level.objmap[1][x][y] = 693;
            }
        }

    }

    open(){
        if(this.curanimname != 'open'){
            this.setSprite('opening');
            this.gotoAndPlay(0);
            sound.play('door-open');

            // remove any blocks
            let sx = Math.floor(this.container.x / this.gameevents.level.tiledimx);
            let sy = Math.floor(this.container.y / this.gameevents.level.tiledimy);
            for(let x = sx; x < sx + 2; x++){
                for(let y = sy; y < sy + 3; y++){
                    this.gameevents.level.objmap[1][x][y] = -1;
                }
            }

        }
    }

    close(){
        if(this.curanimname != 'closed'){
            let charcoords = this.gameevents.mainchar.getCoords();
            if(charcoords.x >= this.container.x && charcoords.x <= this.container.x + 2 * this.gameevents.level.tiledimx &&
               charcoords.y >= this.container.y && charcoords.y <= this.container.y + 3 * this.gameevents.level.tiledimy){
                console.log("Character is in the way of the door");
                return;
            }

            this.setSprite('closing');
            this.gotoAndPlay(0);
            sound.play('door-close');
            // add blocks again 
            let sx = Math.floor(this.container.x / this.gameevents.level.tiledimx);
            let sy = Math.floor(this.container.y / this.gameevents.level.tiledimy);
            for(let x = sx; x < sx + 2; x++){
                for(let y = sy; y < sy + 3; y++){
                    this.gameevents.level.objmap[1][x][y] = 693;
                }
            }
        }
    }
}

export class GrandfatherClock extends THING.Thing {
    constructor(gameevents){
        super("grandfather-clock", gameevents.level.spritesheet_map.get("cozyclock"), gameevents);
        this.registerSprite('stopped', 'row0', true);
        this.registerSprite('runnning', 'row1', true);
        this.setSprite('stopped');
    }

    isRunning(){
        return this.curanimname == 'runnning';
    }

    run(){
        if(this.curanimname != 'runnning'){
            this.setSprite('runnning');
            this.gotoAndPlay(0, .05);
            sound.play('grandfather-clock');
        }
    }

    stop(){
        if(this.curanimname != 'stopped'){
            this.setSprite('stopped');
            this.gotoAndPlay(0);
            sound.stop('grandfather-clock');
        }
    }
    
    listen(){
        sound.play('grandfather-clock');
    }

    onEnter(){
        if(this.isRunning()){
            this.stop();
        }else{
            this.run();
        }
    }

    playAmbientLoop(){
        if(this.isRunning()){
            sound.play('ambient-clock', {loop: true});
        }
    }

    stopAmbientLoop(){
        sound.stop('ambient-clock');
    }
} // end of GrandfatherClock class

// Super class for locations in the map where the character can do something,
// and listen to the other ambient sounds in the room.
export class StayAwhileThing extends THING.Thing {
    constructor(label, gameevent, charcoords, chardir) {
        super(label.label, null, gameevent);

        this.active = false;
        let cx = label.sx + (label.ex - label.sx) / 2;
        let cy = label.sy + (label.ey - label.sy) / 2;
        cx = cx * this.gameevents.level.tiledimx;
        cy = cy * this.gameevents.level.tiledimy;

        console.log("Setting center for " + this.name + " to " + cx + ", " + cy);
        this.setCenter(cx, cy);
        this.savedcharcoords = { x: 0, y: 0 };
        this.savedchardirect = null;
        this.things = [];

        this.charcoords = charcoords;
        this.chardirect = chardir;
    }

    addThingList(thinglist) {
        this.things.push(...thinglist);
    }

    isActive() {
        return this.active;
    }

    doThing() {
        this.active = true;

        this.savedcharcoords = this.gameevents.mainchar.getCoords();
        this.savedchardirect = this.gameevents.mainchar.getDirection();
        this.gameevents.mainchar.leave();
        this.gameevents.mainchar.arrive(this.charcoords.x, this.charcoords.y, this.chardirect);
        this.gameevents.mainchar.freeze();

        console.log("Playing sound for " + this.name);
        if(sound.find(this.name)){
            sound.play(this.name, {loop: true});
        }

        for (let i in this.things) {
            this.things[i].playAmbientLoop();
        }
    }

    stopThing() {
        this.active = false;
        this.gameevents.mainchar.leave();
        this.gameevents.mainchar.arrive(this.savedcharcoords.x, this.savedcharcoords.y, this.savedchardirect);
        this.gameevents.mainchar.thaw();
        
        if(sound.find(this.name)){
            sound.stop(this.name);
        }

        for (let i in this.things) {
            this.things[i].stopAmbientLoop();
        }
    }

    onEnter() {
        if (!this.active) {
            this.doThing();
        } else {
            this.stopThing();
        }
    }
} // StayAwhileThing

export class WritingDesk extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 1496, y: 980}, "DOWN");
    }
}

export class KitchenStool extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 315, y: 917}, "LEFT");
    }
}

export class CuttingStool extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 250, y: 1060}, "UP");
    }
}

export class SleepingDogChair extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 1646, y: 522}, "LEFT");
    }
}

export class WindChair extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 1896, y: 180}, "LEFT");
    }
}

export class EntranceChair extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 312, y: 360}, "LEFT");
    }
}

export class CatChair extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 1000, y: 1306}, "RIGHT");
    }
}

export class PhonographChair extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 1552, y: 1276}, "RIGHT");
    }
}   

export class BookChair extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 1006, y: 610}, "LEFT");
    }
}

export class ChildBed extends StayAwhileThing {
    constructor(label, gameevents){
        super(label, gameevents, {x: 114, y: 1442}, "RIGHT");
    }

    doThing() {
        super.doThing();
        sound.stop('cozy');
        this.gameevents.mainchar.curanim.angle = 270;
    }

    stopThing() {
        this.gameevents.mainchar.curanim.angle = 0;
        super.stopThing();
        sound.play('cozy');
    }
}

export class Phonograph extends THING.Thing {
    constructor(gameevents){
        super("phonograph", null, gameevents);
        this.playing = false;
    }

    play(){
        this.playing = true;
        sound.stop('cozy');
        sound.play('vinyl');
        sound.play('phonograph', {loop: true});
    }

    stop(){
        this.playing = false;
        sound.stop('vinyl');
        sound.stop('phonograph');
        sound.play('cozy');
    }

    onEnter(){
        if(this.playing){
            this.stop();
        }else{
            this.play();
        }
    }
}

export class SoupPot extends THING.Thing {
    constructor(gameevents){
        super("soup-pot", gameevents.level.spritesheet_map.get("soup-pot"), gameevents);

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
        this.gotoAndPlay(0);
    }

    extinguish(){
        this.lit = false;
        this.setSprite('unlit');
        this.gotoAndPlay(0);
        sound.stop('light-fire');
    }

    onEnter(){
        if(this.lit){
            this.extinguish();
        }else{
            this.light();
        }
    }

    playAmbientLoop(){
        if(this.lit){
            sound.play('soup-pot', {loop: true});
        }
    }

    stopAmbientLoop(){
        sound.stop('soup-pot');
    }
    
}

export class Fireplace extends THING.Thing {

    constructor(gameevents){
        super("fireplace", gameevents.level.spritesheet_map.get("fireplace"), gameevents);

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

    extinguish(){
        this.lit = false;
        this.setSprite('unlit');
    }

    listen(){
        sound.play('listen-fire');
    }

    playAmbientLoop(){
        if(this.lit){
            sound.play('listen-fire', {loop: true});
        }
    }

    stopAmbientLoop(){
        sound.stop('listen-fire');
    }

    onEnter(){
        if(this.lit){
            this.extinguish();
        }else{
            this.light();
        }
    }
}