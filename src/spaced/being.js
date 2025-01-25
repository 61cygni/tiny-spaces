import * as PIXI from 'pixi.js'

import * as SCREEN from './screen.js';

export const Dir = {};

Dir[Dir[0] = 'UP']    = 1;
Dir[Dir[1] = 'DOWN']  = 2;
Dir[Dir[2] = 'LEFT']  = 4;
Dir[Dir[3] = 'RIGHT'] = 8;

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
        this.focus = false;

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

        this.screencenterx = SCREEN.instance().width/2;
        this.screencentery = SCREEN.instance().height/2;
        console.log("Screen center ", this.screencenterx, this.screencentery);
    }

    setFocus(bool){
        this.focus = bool;
    }

    updateScreen(){
        if(!this.here){
            return;
        }
        // console.log("Updating screen ", this.screencenterx, this.screencentery, this.worldx, this.worldy);
        // update map with given world and screen coordinates
        let xdelta = this.screencenterx - this.worldx;
        let ydelta = this.screencentery - this.worldy;
        this.level.container.x = xdelta;
        this.level.container.y = ydelta;
    }

    arrive(x, y) {
        if (this.focus) {
            this.curanim.x = this.screencenterx;
            this.curanim.y = this.screencentery;
            this.worldx = x; 
            this.worldy = y;
            console.log("Focused character arriving at level ", this.worldx, this.worldy);
        }else{
            this.curanim.x = x;
            this.curanim.y = y;
        }


        if (this.sprites != null) {
            this.curanim = this.sprites[this.direction];
            this.curanim.animationSpeed = 0.1666;
            this.curanim.stop();
            if(this.focus){
                this.app.stage.addChild(this.curanim);
            }else{
                this.level.container.addChild(this.curanim);
            }
        }

        this.here = true;
        if(this.focus){
            this.updateScreen()
        }
    }

    leave(){
        this.here = false;
        if(this.sprites != null){
            this.curanim.stop();
            this.app.stage.removeChild(this.curanim);
        }
    }

    isBlockedCurDir(){
        if (this.focus) {
            if (this.direction == 'RIGHT') {
                return (this.isBlocked(this.worldx + 11, this.worldy + 16) ||
                    this.isBlocked(this.worldx + 11, this.worldy + 25));
            } if (this.direction == 'LEFT') {
                return (this.isBlocked(this.worldx + 1, this.worldy + 16) ||
                    this.isBlocked(this.worldx + 1, this.worldy + 25));
            } if (this.direction == 'UP') {
                return (this.isBlocked(this.worldx + 4, this.worldy + 15) ||
                    this.isBlocked(this.worldx + 10, this.worldy + 15));
            } if (this.direction == 'DOWN') {
                return (this.isBlocked(this.worldx + 4, this.worldy + 26) ||
                    this.isBlocked(this.worldx + 10, this.worldy + 26));
            }
        } else {
            if (this.direction == 'RIGHT') {
                return (this.isBlocked(this.curanim.x + 11, this.curanim.y + 16) ||
                    this.isBlocked(this.curanim.x + 11, this.curanim.y + 25));
            } if (this.direction == 'LEFT') {
                return (this.isBlocked(this.curanim.x + 1, this.curanim.y + 16) ||
                    this.isBlocked(this.curanim.x + 1, this.curanim.y + 25));
            } if (this.direction == 'UP') {
                return (this.isBlocked(this.curanim.x + 4, this.curanim.y + 15) ||
                    this.isBlocked(this.curanim.x + 10, this.curanim.y + 15));
            } if (this.direction == 'DOWN') {
                return (this.isBlocked(this.curanim.x + 4, this.curanim.y + 26) ||
                    this.isBlocked(this.curanim.x + 10, this.curanim.y + 26));
            }
        }
        console.log("Error, no direction set ", this.direction);
        return false;
    }

    goDir(dir) {
        if(this.direction != dir){
            this.direction = dir;
            if (this.sprites != null) {
                if(this.focus){
                    this.app.stage.removeChild(this.curanim)
                }else{
                    this.level.container.removeChild(this.curanim)
                }
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
                if(this.focus){
                    this.app.stage.addChild(this.curanim);
                }else{
                    this.level.container.addChild(this.curanim);
                }
                this.curanim.play();
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
        let coordsx = Math.floor(x / this.level.tiledimx);
        let coordsy = Math.floor(y / this.level.tiledimy);
        let ret = this.level.objmap[0][coordsx][coordsy] != -1 || this.level.objmap[1][coordsx][coordsy] != -1;
        return ret;
    }

    curBGTile(){
        let coordsx = Math.floor((this.worldx + 11) / this.level.tiledimx);
        let coordsy = Math.floor((this.worldy + 16) / this.level.tiledimy);
        return this.level.bgtiles[0][coordsx][coordsy];
    }

    tick(delta){
        if (this.moving) {
            if (this.direction == 'RIGHT') {
                if (this.timeToMove(delta) && !this.isBlockedCurDir()) {
                    if (this.focus) {
                        this.worldx = this.worldx + 1;
                        this.updateScreen();
                    }else{
                        this.curanim.x = this.curanim.x + 1;
                    }
                }
            }
            else if (this.direction == 'LEFT') {
                if (this.timeToMove(delta) && !this.isBlockedCurDir()) {
                    if (this.focus) {
                        this.worldx = this.worldx - 1;
                        this.updateScreen();
                    }else{
                        this.curanim.x = this.curanim.x - 1;
                    }
                }
            }
            else if (this.direction == 'UP') {
                if (this.timeToMove(delta) && !this.isBlockedCurDir()) {
                    if (this.focus) {
                        this.worldy = this.worldy - 1;
                        this.updateScreen();
                    }else{
                        this.curanim.y = this.curanim.y - 1;
                    }
                }
            }
            else if (this.direction == 'DOWN') {
                if (this.timeToMove(delta) && !this.isBlockedCurDir()) {
                    if (this.focus) {
                        this.worldy = this.worldy + 1;
                        this.updateScreen();
                    }else{
                        this.curanim.y = this.curanim.y + 1;
                    }
                }
            }
        }
    } // tick
} // class being

export function NoBeing(){
    return new Being(null, null);
}