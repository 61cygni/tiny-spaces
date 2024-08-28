import * as PIXI from 'pixi.js'

const Dir = {};

Dir[Dir[0] = 'UP']    = 1;
Dir[Dir[1] = 'DOWN']  = 2;
Dir[Dir[2] = 'LEFT']  = 4;
Dir[Dir[4] = 'RIGHT'] = 8;

export class Being {

    constructor(app, spritesheet, level) {
        this.app = app;
        this.sheet = spritesheet;
        this.level = level;
        this.sprites = {};
        this.sprites['DOWN'] = new PIXI.AnimatedSprite(this.sheet.animations.row0);
        this.sprites['UP']   = new PIXI.AnimatedSprite(this.sheet.animations.row1);
        this.sprites['LEFT'] = new PIXI.AnimatedSprite(this.sheet.animations.row3);
        // Flip right for left
        if (!this.sheet.animations.hasOwnProperty('row3')) {
            this.sprites['RIGHT'] = new PIXI.AnimatedSprite(this.sheet.animations.row2);
            this.sprites['RIGHT'].scale.x = -1;
        }else{
            this.sprites['RIGHT'] = new PIXI.AnimatedSprite(this.sheet.animations.row2);
        }

        this.pausetime = Math.floor(Math.random() * 5);;
        this.pausecountdown = this.pausetime;

        this.moving = 0;
        this.direction = 'DOWN'; 
        this.curanim = this.sprites['DOWN'];
        this.curanim.animationSpeed = 0.1666;
        this.curanim.x = -1 
        this.curanim.y = -1 
    }

    arrive(x, y) {
        this.curanim = this.sprites[this.direction];
        this.curanim.x = x
        this.curanim.y = y
        this.curanim.animationSpeed = 0.1666;
        this.curanim.stop();
        this.app.stage.addChild(this.curanim);
    }

    leave(){
        this.curanim.stop();
        this.app.stage.removeChild(this.curanim);
    }

    goDir(dir) {
        if(this.direction != dir){
            this.direction = dir;
            this.app.stage.removeChild(this.curanim)
            this.curanim.stop()
            this.x = this.curanim.x
            this.y = this.curanim.y
            this.curanim = this.sprites[dir];
            this.curanim.animationSpeed = 0.1666;
            this.curanim.x = this.x
            this.curanim.y = this.y
            this.curanim.play();
            this.app.stage.addChild(this.curanim);
        } 
        else if(!this.curanim.playing){
            this.x = this.curanim.x
            this.y = this.curanim.y
            this.curanim.play();
        }
        this.moving |= Dir[dir];
    }

    stopDir(dir) {
            this.moving &= ~Dir[dir]; // bitmask
            if(this.moving == 0){
                this.curanim.stop();
            }
    }

    timeToMove(){
        return true;

        // FIXME
        // let ret = this.pausecountdown--;
        // if(ret <= 0){
        //     this.pausecountdown = this.pausetime;
        //     return true;
        // }
        // return false;
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

    tick(delta){
        if (this.moving && this.curanim.x < 624 && this.curanim.x > -1 && this.curanim.y < 448 && this.curanim.y > -1) {
            if (this.direction == 'RIGHT') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x + 11, this.curanim.y + 16) ||
                        this.isBlocked(this.curanim.x + 11, this.curanim.y + 25)){
                    } else {
                        this.curanim.x = this.curanim.x + 1;
                    }
                }
            }
            else if (this.direction == 'LEFT') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x + 1, this.curanim.y + 16) ||
                       this.isBlocked(this.curanim.x + 1, this.curanim.y + 25)){
                    } else {
                        this.curanim.x = this.curanim.x - 1;
                    }
                }
            }
            else if (this.direction == 'UP') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x + 4, this.curanim.y + 15) ||
                       this.isBlocked(this.curanim.x + 10, this.curanim.y + 15)){
                    } else {
                        this.curanim.y = this.curanim.y - 1;
                    }
                }
            }
            else if (this.direction == 'DOWN') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x + 4, this.curanim.y + 26) || 
                       this.isBlocked(this.curanim.x + 10, this.curanim.y + 26)){
                    } else {
                        this.curanim.y = this.curanim.y + 1;
                    }
                }
            }
        }
    } // tick
} // class being