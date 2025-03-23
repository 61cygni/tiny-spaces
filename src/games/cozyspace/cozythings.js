import * as THING  from '@spaced/thing.js';

import { sound } from '@pixi/sound';

export class GrandfatherClock extends THING.Thing {
    constructor(gameevents){
        super("grandfather-clock", null, gameevents.level);
    }
    
    listen(){
        sound.play('grandfather-clock');
    }
    
}

export class SoupPot extends THING.Thing {
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

export class Fireplace extends THING.Thing {

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