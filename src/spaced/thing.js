// generic class for a thing in an object
import * as GLOBALS from './globals.js';

import * as PIXI from 'pixi.js'

export class Thing {

    constructor(name, spritesheet, level) {
        this.name = name;
        this.app = null;
        this.sheet = spritesheet;
        this.level = level;
        
        this.animationtime = -1;
        this.here = false; 
        this.focus = false;
        this.curanim = null;
        this.curanimname = null;
        this.container = new PIXI.Container();
        this.container.zIndex = GLOBALS.ZINDEX.THING;
        this.sprites = {};
    }

    registerSprite(name, row, loop=true){
        this.sprites[name] = new PIXI.AnimatedSprite(this.sheet.animations[row]);
        this.sprites[name].loop = loop;
    }

    setSprite(name){
        this.curanim = this.sprites[name];
        this.curanim.animationSpeed = 0.1066;
        this.curanimname = name;

        this.container.addChild(this.curanim);
    }

    setLocation(x, y){
        this.container.x = x;
        this.container.y = y;
    }

    arrive(x, y) {
        this.container.x = x;
        this.container.y = y;

        this.level.container.addChild(this.container);
        this.here = true;
    }

    distance(tothing){
        if(this.name === tothing.name){
            console.log("Error, cant call distance on self");
            return -1;
        }
        if(this.focus){
            console.log("Things should never be in focus");
            return -1;
        }

        let ret = -1;
        if(tothing.focus){
            // distance to main character
            ret = Math.sqrt(Math.pow(tothing.worldx - this.container.x, 2) + Math.pow(tothing.worldy - this.container.y, 2));
        }else{
            ret = Math.sqrt(Math.pow(tothing.container.x - this.container.x, 2) + Math.pow(tothing.container.y - this.container.y, 2));
        }
        return ret;
    }

    leave(){
        this.here = false;
        if (this.sprites != null) {
            this.curanim.stop();
            this.level.container.removeChild(this.container);
        }
    }

    destroy(){
        for(let key in this.sprites){
            this.sprites[key].destroy();
        }
    }

    stopAnim() {
        if(this.sprites != null){
            this.curanim.stop();
        }
    }

    startAnim() {
        if(this.sprites != null){
            if(this.curanim.playing){
                console.log("Thing is already playing an animation");
                return;
            }
            this.curanim.play();
        }
    }

    gotoAndPlay(frame) {
        if(this.curanim != null){
            this.curanim.gotoAndPlay(frame);
        }
    }

    playAnimFor(time) {
        if(this.sprites != null){
            if(this.curanim.playing){
                console.log("Thing is already playing an animation");
                returnl
            }
            this.curanim.play();
        }
    }

    curBGTile(){
        let coordsx = Math.floor((this.worldx + 11) / this.level.tiledimx);
        let coordsy = Math.floor((this.worldy + 16) / this.level.tiledimy);
        return this.level.bgtiles[0][coordsx][coordsy];
    }

    tick(delta){
        if(this.animationtime > 0){
            this.animationtime -= delta;
            if(this.animationtime <= 0){
                this.stopAnim();
                this.animationtime = -1;
            }
        }
    }

} // -- end of class Thing