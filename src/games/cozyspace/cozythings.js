import * as THING  from '@spaced/thing.js';

import { sound } from '@pixi/sound';

export function initSoundsOnce() {
    sound.add('soup-pot', './audio/souppot.mp3');
    sound.add('person-eating', './audio/person-eating.mp3');
    sound.add('writing-desk', './audio/writing-desk.mp3');
    sound.add('door-open', './audio/door-open.mp3');
    sound.add('door-close', './audio/door-close.mp3');
    sound.add('grandfather-clock', './audio/grandfather-clock.mp3');
    sound.add('light-fire', './audio/lighting-a-fire.mp3');
    sound.add('listen-fire', './audio/camp-fire.mp3');
    sound.add('ambient-clock', './audio/clock-tick.mp3');
    sound.find('grandfather-clock').volume = 0.2;
    sound.find('soup-pot').volume = 0.3;
    sound.find('light-fire').volume = 0.2;
    sound.find('listen-fire').volume = 0.2;
    sound.find('door-open').volume = 0.2;
    sound.find('door-close').volume = 0.2;
    sound.find('person-eating').volume = 0.4;
    sound.find('writing-desk').volume = 0.9;
    sound.find('ambient-clock').volume = 0.1;
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

    open(){
        if(this.curanimname != 'open'){
            this.setSprite('opening');
            this.gotoAndPlay(0);
            sound.play('door-open');
        }
    }

    close(){
        if(this.curanimname != 'closed'){
            this.setSprite('closing');
            this.gotoAndPlay(0);
            sound.play('door-close');
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

export class WritingDesk extends THING.Thing {
    constructor(label, gameevents){
        super("writing-desk", null, gameevents);
        this.writing = false;

        let cx = label.sx + (label.ex - label.sx) / 2;
        let cy = label.sy + (label.ey - label.sy) / 2;
        cx = cx * this.gameevents.level.tiledimx;
        cy = cy * this.gameevents.level.tiledimy;

        this.setLocation(cx, cy);
        this.charcoords = {x: 0, y: 0};
        this.chardirect = null;
        this.things = [];


    }

    addThingList(thinglist){
        this.things.push(...thinglist);
    }

    isWriting(){
        return this.writing;
    }
    
    write(){
        this.writing = true;

        this.charcoords = this.gameevents.mainchar.getCoords();
        this.gameevents.mainchar.leave();
        this.gameevents.mainchar.arrive(1496,980, "DOWN");
        sound.play('writing-desk', {loop: true});
        this.gameevents.mainchar.freeze();


        console.log(this.things);
        for(let i in this.things){
            this.things[i].playAmbientLoop();
        }
    }

    stopWriting(){
        this.writing = false;
        sound.stop('writing-desk');
        this.gameevents.mainchar.leave();
        this.gameevents.mainchar.arrive(this.charcoords.x, this.charcoords.y);
        this.gameevents.mainchar.thaw();

        for(let i in this.things){
            this.things[i].stopAmbientLoop();
        }
    }

    onEnter(){
        if(!this.writing){
            this.write();
        }else{
            this.stopWriting();
        }
    }

}

export class KitchenStool extends THING.Thing {
    constructor(label, gameevents){
        super("kitchen-stool", null, gameevents);
        this.sitting = false;

        let cx = label.sx + (label.ex - label.sx) / 2;
        let cy = label.sy + (label.ey - label.sy) / 2;
        cx = cx * this.gameevents.level.tiledimx;
        cy = cy * this.gameevents.level.tiledimy;

        this.setLocation(cx, cy);
        this.charcoords = {x: 0, y: 0};
        this.chardirect = null;
        this.things = [];
    }

    addThingList(thinglist){
        this.things.push(...thinglist);
    }

    isSitting(){
        return this.sitting;
    }
    
    sit(){
        this.sitting = true;

        this.charcoords = this.gameevents.mainchar.getCoords();
        this.gameevents.mainchar.leave();
        this.gameevents.mainchar.arrive(315,917, "LEFT");
        sound.play('person-eating', {loop: true});
        this.gameevents.mainchar.freeze();


        for(let i in this.things){
            this.things[i].playAmbientLoop();
        }
    }

    getUp(){
        this.sitting = false;
        sound.stop('person-eating');
        this.gameevents.mainchar.leave();
        this.gameevents.mainchar.arrive(this.charcoords.x, this.charcoords.y);
        this.gameevents.mainchar.thaw();

        for(let i in this.things){
            this.things[i].stopAmbientLoop();
        }
    }

    onEnter(){
        if(!this.sitting){
            this.sit();
        }else{
            this.getUp();
        }
    }

} // end of KitchenStool class


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
        this.startAnim();      
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