import * as PIXI from 'pixi.js'

const Dir = {};

Dir[Dir[0] = 'UP']    = 1;
Dir[Dir[1] = 'DOWN']  = 2;
Dir[Dir[2] = 'LEFT']  = 4;
Dir[Dir[4] = 'RIGHT'] = 8;

export class Being {

    constructor(app, spritesheet, level, x, y) {
        this.app = app;
        this.sheet = spritesheet;
        this.level = level;
        this.sprites = {};
        this.sprites['DOWN'] = new PIXI.AnimatedSprite(this.sheet.animations.row0);
        this.sprites['UP']   = new PIXI.AnimatedSprite(this.sheet.animations.row1);
        this.sprites['LEFT'] = new PIXI.AnimatedSprite(this.sheet.animations.row2);
        // Flip right for left
        if (!this.sheet.animations.hasOwnProperty('row3')) {
            this.sprites['RIGHT'] = new PIXI.AnimatedSprite(this.sheet.animations.row2);
            this.sprites['RIGHT'].scale.x = -1;
        }else{
            this.sprites['RIGHT'] = new PIXI.AnimatedSprite(this.sheet.animations.row3);
        }

        this.x = x; 
        this.y = y; 
        this.pausetime = Math.floor(Math.random() * 5);;
        this.pausecountdown = this.pausetime;

        this.moving = 0;
        this.direction = 'DOWN'; 
        this.curanim = this.sprites['DOWN'];
        this.curanim.animationSpeed = 0.1666;
        this.curanim.x = this.x
        this.curanim.y = this.y
        this.curanim.play();
        app.stage.addChild(this.curanim);
    }

    arrive() {
        this.curanim = this.sprites[this.direction];
        this.curanim.x = this.x
        this.curanim.y = this.y
        this.curanim.animationSpeed = 0.1666;
        this.curanim.stop();
        this.app.stage.addChild(this.curanim);
    }

    goDir(dir) {
        if(this.direction != dir){
            this.direction = dir;
            this.moving |= Dir[dir];
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
            this.curanim.play();
        }


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

    isBlocked(x, y){
        if(!this.level){
            return;
        }
        let coordsx = Math.floor(x / 16);
        let coordsy = Math.floor(y / 16);
        let ret = this.level.objmap[0][coordsx][coordsy] != -1;
        if(ret){
            console.log("blocked "+coordsx+" : "+coordsy);
        }
        return ret;
    }

    tick(){
        if (this.moving && this.curanim.x < 624 && this.curanim.x > -1 && this.curanim.y < 448 && this.curanim.y > -1) {
            if (this.direction == 'RIGHT') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x + 16, this.curanim.y + 16)){
                    } else {
                        this.curanim.x = this.curanim.x + 1;
                    }
                }
            }
            else if (this.direction == 'LEFT') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x - 1, this.curanim.y + 16)){
                    } else {
                        this.curanim.x = this.curanim.x - 1;
                    }
                }
            }
            else if (this.direction == 'UP') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x, this.curanim.y +15)){
                    } else {
                        this.curanim.y = this.curanim.y - 1;
                    }
                }
            }
            else if (this.direction == 'DOWN') {
                if (this.timeToMove()) {
                    if(this.isBlocked(this.curanim.x, this.curanim.y + 32)){
                    } else {
                        this.curanim.y = this.curanim.y + 1;
                    }
                }
            }
        }else{
            // const rdir = getRandomInt(4);
            
            // this.direction = Dir[rdir];

            // this.app.stage.removeChild(this.curanim)
            // this.curanim.stop()
            // if(this.curanim.x < 0){
            //     this.curanim.x = 0;
            // }
            // if(this.curanim.x > 623){
            //     this.curanim.x = 623;
            // }
            // if(this.curanim.y < 0){
            //     this.curanim.y = 0;
            // }
            // if(this.curanim.y > 447){
            //     this.curanim.y = 447;
            // }
            // this.x = this.curanim.x
            // this.y = this.curanim.y
            // this.curanim = this.sprites[this.direction];
            // this.curanim.x = this.x
            // this.curanim.y = this.y
            // this.curanim.animationSpeed = 0.1666;
            // this.curanim.play();
            // this.app.stage.addChild(this.curanim);
        }
    }
}