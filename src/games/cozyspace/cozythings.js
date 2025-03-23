import * as THING  from '@spaced/thing.js';

import { sound } from '@pixi/sound';

export function initSoundsOnce() {
    sound.add('soup-pot', './audio/souppot.mp3');
    sound.add('writing-desk', './audio/writing-desk.mp3');
    sound.add('door-open', './audio/door-open.mp3');
    sound.add('door-close', './audio/door-close.mp3');
    sound.add('grandfather-clock', './audio/grandfather-clock.mp3');
    sound.add('light-fire', './audio/lighting-a-fire.mp3');
    sound.add('listen-fire', './audio/camp-fire.mp3');
    sound.find('grandfather-clock').volume = 0.2;
    sound.find('soup-pot').volume = 0.3;
    sound.find('light-fire').volume = 0.2;
    sound.find('listen-fire').volume = 0.3;
    sound.find('door-open').volume = 0.2;
    sound.find('door-close').volume = 0.2;
    sound.find('writing-desk').volume = 0.8;
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
        super("grandfather-clock", null, gameevents);
    }
    
    listen(){
        sound.play('grandfather-clock');
    }
    
}

export class WritingDesk extends THING.Thing {
    constructor(gameevents){
        super("writing-desk", null, gameevents);
        this.writing = false;

        this.charcoords = {x: 0, y: 0};
        this.chardirect = null;
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
    }

    stopWriting(){
        this.writing = false;
        sound.stop('writing-desk');
        this.gameevents.mainchar.leave();
        this.gameevents.mainchar.arrive(this.charcoords.x, this.charcoords.y);
        this.gameevents.mainchar.thaw();
    }

    onEnter(){
        if(!this.writing){
            this.write();
        }else{
            this.stopWriting();
        }
    }

    onLeave(){
        this.writing = false;
        sound.stop('writing-desk');
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
        this.startAnim();      
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

    listen(){
        sound.play('listen-fire');
    }
}