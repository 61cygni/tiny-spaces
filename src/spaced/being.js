import * as PIXI from 'pixi.js'
import * as GLOBALS from './globals.js';
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
        this.container = new PIXI.Container();
        this.container.zIndex = GLOBALS.ZINDEX.BEING;

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

            // for the mainchar this is the position within the level (same as this.container.x/y for
            // non focus characters). It's tracked seprately because the container is fixed to screen center
            // for the main character and the level is moved instead.  
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


    distance(being){
        if(this.focus){
            console.log("Error, right now can only calculate from non focused beings");
            return;
        }
        if(!being.focus){
            console.log("Error, can't calculate distance to focused being");
            return;
        }

        let ret = Math.sqrt(Math.pow(being.worldx - this.container.x, 2) + Math.pow(being.worldy - this.container.y, 2));
        // console.log("Distance to being ", this.container.x, this.container.y, " is ", ret);
        return ret;
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
            this.container.x = this.screencenterx;
            this.container.y = this.screencentery;
            this.worldx = x; 
            this.worldy = y;
            console.log("Focused character arriving at level ", this.worldx, this.worldy);
        }else{
            this.container.x = x;
            this.container.y = y;
            // this.curanim.x = x;
            // this.curanim.y = y;
        }


        if (this.sprites != null) {
            this.curanim = this.sprites[this.direction];
            this.curanim.animationSpeed = 0.1666;
            this.curanim.stop();
            this.container.addChild(this.curanim);
            if(this.focus){
                this.app.stage.addChildAt(this.container);
            }else{
                this.level.container.addChildAt(this.container, GLOBALS.ZINDEX.BEING);
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
            if(this.focus){
                this.app.stage.removeChild(this.container);
            }else{
                this.level.container.removeChild(this.container);
            }
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
                return (this.isBlocked(this.container.x + 11, this.container.y + 16) ||
                    this.isBlocked(this.container.x + 11, this.container.y + 25));
            } if (this.direction == 'LEFT') {
                return (this.isBlocked(this.container.x + 1, this.container.y + 16) ||
                    this.isBlocked(this.container.x + 1, this.container.y + 25));
            } if (this.direction == 'UP') {
                return (this.isBlocked(this.container.x + 4, this.container.y + 15) ||
                    this.isBlocked(this.container.x + 10, this.container.y + 15));
            } if (this.direction == 'DOWN') {
                return (this.isBlocked(this.container.x + 4, this.container.y + 26) ||
                    this.isBlocked(this.container.x + 10, this.container.y + 26));
            }
        }
        console.log("Error, no direction set ", this.direction);
        return false;
    }

    goDir(dir) {
        if(this.direction != dir){
            this.direction = dir;
            if (this.sprites != null) {
                this.container.removeChild(this.curanim);
                this.curanim.stop()
            }

            if (this.sprites != null) {
                this.curanim = this.sprites[dir];
            }

            this.curanim.animationSpeed = 0.1666;
            if (this.sprites != null) {
                this.curanim.zIndex = GLOBALS.ZINDEX.BEING;
                this.container.addChild(this.curanim);
                if(this.focus){
                    this.app.stage.addChild(this.container);
                }else{
                    this.level.container.addChildAt(this.container, GLOBALS.ZINDEX.BEING);

                    console.log("Level container sortable: ", this.level.container.sortableChildren);
                    console.log("Being container zIndex: ", this.container.zIndex);
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

    stop() {
        this.moving = 0;
        if(this.sprites != null){
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

    doMove(x, y){
        if(this.focus){
            let tx = this.worldx + x;
            let ty = this.worldy + y;
            if(tx < 0 || ty < 0 || tx >= this.level.levelxpixels || ty >= this.level.levelypixels){
                return;
            }
            this.worldx = this.worldx + x;
            this.worldy = this.worldy + y;
            this.updateScreen();
        }else{
            // let tx = this.curanim.x + x;
            // let ty = this.curanim.y + y;
            let tx = this.container.x + x;
            let ty = this.container.y + y;
            if(tx < 0 || ty < 0 || tx >= this.level.levelxpixels || ty >= this.level.levelypixels){
                return;
            }
            this.container.x = this.container.x + x;
            this.container.y = this.container.y + y;
        }
    }

    tick(delta){
        if (this.moving && this.timeToMove(delta)) {
            if (this.direction == 'RIGHT') {
                if (!this.isBlockedCurDir()) {
                    this.doMove(1, 0);
                }
            }
            else if (this.direction == 'LEFT') {
                if (!this.isBlockedCurDir()) {
                    this.doMove(-1, 0);
                }
            }
            else if (this.direction == 'UP') {
                if (!this.isBlockedCurDir()) {
                    this.doMove(0, -1);
                }
            }
            else if (this.direction == 'DOWN') {
                if (!this.isBlockedCurDir()) {
                    this.doMove(0, 1);
                }
            }
        }
    } // tick

} // class being

export function NoBeing(){
    return new Being(null, null);
}