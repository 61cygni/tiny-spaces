import * as PIXI from 'pixi.js'

const Dir = {};

Dir[Dir[0] = 'UP']    = 1;
Dir[Dir[1] = 'DOWN']  = 2;
Dir[Dir[2] = 'LEFT']  = 4;
Dir[Dir[4] = 'RIGHT'] = 8;

class PhonySprite{
    constructor(){
    }
};

export class Being {

    constructor(spritesheet, level) {
        this.app = null;
        this.here = false; // on level or not.
        this.sheet = spritesheet;
        this.level = level;
        this.sprites = {};

        if (this.sheet != null) {
            this.sprites['DOWN'] = new PIXI.AnimatedSprite(this.sheet.animations.row0);
            this.sprites['UP'] = new PIXI.AnimatedSprite(this.sheet.animations.row1);
            this.sprites['LEFT'] = new PIXI.AnimatedSprite(this.sheet.animations.row3);
            // Flip right for left
            if (!this.sheet.animations.hasOwnProperty('row3')) {
                this.sprites['RIGHT'] = new PIXI.AnimatedSprite(this.sheet.animations.row2);
                this.sprites['RIGHT'].scale.x = -1;
            } else {
                this.sprites['RIGHT'] = new PIXI.AnimatedSprite(this.sheet.animations.row2);
            }

            this.movedelta = .1; // FIXME don't use magic number
            this.pausecountdown = this.movedelta;

            this.moving = 0;
            this.direction = 'DOWN';
            this.curanim = this.sprites['DOWN'];
            this.curanim.animationSpeed = 0.1666;

            // position in world
            this.worldx = -1;
            this.worldy = -1;

            // position on screen
            this.curanim.x = -1;
            this.curanim.y = -1;
        }else{
            let phony = new PhonySprite();
            phony.x = -1;
            phony.y = -1;
            phony.animationSpeed = 0;
            this.curanim = phony; 
            this.sprites = null;
        }

        // TODO FIXME remove magic numbers
        this.screencenterx = 640/2;
        this.screencentery = 480/2;
    }

    updateScreen(){
        if(!this.here){
            return;
        }
        // update map with given world and screen coordinates
        let xdelta = this.screencenterx - this.worldx;
        let ydelta = this.screencentery - this.worldy;
        this.level.container.x = xdelta;
        this.level.container.y = ydelta;
    }

    arrive(x, y) {
        this. curanim.x = this.screencenterx;
        this. curanim.y = this.screencentery;

        this.worldx = x; 
        this.worldy = y;

        if (this.sprites != null) {
            this.curanim = this.sprites[this.direction];
            this.curanim.animationSpeed = 0.1666;
            this.curanim.stop();
            this.app.stage.addChild(this.curanim);
        }

        this.here = true;
        this.updateScreen()
    }

    leave(){
        this.here = false;
        if(this.sprites != null){
            this.curanim.stop();
            this.app.stage.removeChild(this.curanim);
        }
    }

    goDir(dir) {
        if(this.direction != dir){
            this.direction = dir;
            if (this.sprites != null) {
                this.app.stage.removeChild(this.curanim)
                this.curanim.stop()
            }
            this.x = this.curanim.x
            this.y = this.curanim.y

            if (this.sprites != null) {
                this.curanim = this.sprites[dir];
            }
            this.curanim.animationSpeed = 0.1666;
            this.curanim.x = this.x
            this.curanim.y = this.y
            if (this.sprites != null) {
                this.curanim.play();
                this.app.stage.addChild(this.curanim);
            }
        } 
        else if(!this.curanim.playing){
            this.x = this.curanim.x
            this.y = this.curanim.y
            if (this.sprites != null) {
                this.curanim.play();
            }
        }
        this.moving |= Dir[dir];
    }

    stopDir(dir) {
        this.moving &= ~Dir[dir]; // bitmask
        if(this.moving == 0 && this.sprites != null){
            this.curanim.stop();
        }
    }

    timeToMove(delta) {
        this.pausecountdown = this.pausecountdown - delta;

        if (this.pausecountdown <= 0) {
            this.pausecountdown = this.movedelta;
            return true;
        }
        return false;
    }

    // --
    // For collisions. Only check the bottom 16x16 section
    // --
    isBlocked(x, y){
        if(!this.level){
            return;
        }
        let coordsx = Math.floor(x / 16);
        let coordsy = Math.floor(y / 16);
        let ret = this.level.objmap[0][coordsx][coordsy] != -1;
        return ret;
    }

    curBGTile(){
        let coordsx = Math.floor((this.worldx + 11) / 16);
        let coordsy = Math.floor((this.worldy + 16) / 16);
        return this.level.bgtiles[0][coordsx][coordsy];
    }

    tick(delta){
        if (this.moving) {
            if (this.direction == 'RIGHT') {
                if (this.timeToMove(delta)) {
                    if(this.isBlocked(this.worldx + 11, this.worldy + 16) ||
                        this.isBlocked(this.worldx + 11, this.worldy + 25)){
                    } else {
                        this.worldx = this.worldx + 1;
                        this.updateScreen();
                    }
                }
            }
            else if (this.direction == 'LEFT') {
                if (this.timeToMove(delta)) {
                    if(this.isBlocked(this.worldx + 1, this.worldy + 16) ||
                       this.isBlocked(this.worldx + 1, this.worldy + 25)){
                    } else {
                        this.worldx = this.worldx - 1;
                        this.updateScreen();
                    }
                }
            }
            else if (this.direction == 'UP') {
                if (this.timeToMove(delta)) {
                    if(this.isBlocked(this.worldx + 4, this.worldy + 15) ||
                       this.isBlocked(this.worldx + 10, this.worldy + 15)){
                    } else {
                        this.worldy = this.worldy - 1;
                        this.updateScreen();
                        //this.curanim.y = this.curanim.y - 1;
                    }
                }
            }
            else if (this.direction == 'DOWN') {
                if (this.timeToMove(delta)) {
                    if(this.isBlocked(this.worldx + 4, this.worldy + 26) || 
                       this.isBlocked(this.worldx + 10, this.worldy + 26)){
                    } else {
                        this.worldy = this.worldy + 1;
                        this.updateScreen();
                    }
                }
            }
        }
    } // tick
} // class being

export function NoBeing(){
    return new Being(null, null);
}