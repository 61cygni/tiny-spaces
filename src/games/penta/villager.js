import * as BEING from '../../spaced/being.js';

export class Villager extends BEING.Being {
    constructor(spritesheet, level) {
        super(spritesheet, level);
        this.focus = false;
        this.walk = 0;
        this.movedelta = .2;
    }

    tick(delta){
        if(!this.here){
            return;
        }
        if(this.walk <= 0){
            let direction = Math.floor(Math.random() * 4);
            let dir = BEING.Dir[''+direction];
            this.goDir(dir);
            this.walk = Math.floor(Math.random() * 100) + 1;
        }else{
            if(this.timeToMove(delta)){
                this.walk--;
            }
        }
        super.tick(delta);
    }
} // class Villager
