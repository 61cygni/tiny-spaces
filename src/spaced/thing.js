// generic class for a thing in an object
import * as GLOBALS from './globals.js';

import * as PIXI from 'pixi.js'

export class Thing {

    constructor(name, spritesheet, gameevents) {
        this.name = name;
        this.app = null;
        this.sheet = spritesheet;
        this.gameevents = gameevents;
        
        this.animationtime = -1;
        this.here = false; 
        this.focus = false;
        this.curanim = null;
        this.curanimname = null;
        this.container = new PIXI.Container();
        this.container.zIndex = GLOBALS.ZINDEX.THING;
        this.sprites = {};

        this.width = 0;
        this.height = 0;
        this.centerx = -1;
        this.centery = -1;
    }

    registerSprite(name, row, loop=true){
        this.sprites[name] = new PIXI.AnimatedSprite(this.sheet.animations[row]);
        this.sprites[name].loop = loop;
        this.width = this.sprites[name].width;
        this.height = this.sprites[name].height;
    }

    setSprite(name){
        this.curanim = this.sprites[name];
        this.curanimname = name;

        this.container.addChild(this.curanim);
    }

    setLocation(x, y){
        if(!this.sheet){
            console.log("Error: cannot set location for thing with no sheet");
            return;
        }
        this.container.x = x;
        this.container.y = y;
        this.setCenter(x + this.width / 2, y + this.height / 2);
    }

    setCenter(x, y){
        this.centerx = x;
        this.centery = y;
    }

    arrive(x, y) {
        if(!this.sheet){
            console.log("Error: cannot arrive for thing with no sheet");
            return;
        }

        this.container.x = x;
        this.container.y = y;
        this.setCenter(x + this.width / 2, y + this.height / 2);

        this.gameevents.level.container.addChild(this.container);
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
            let tothingcenterx = tothing.worldx + tothing.sprites['DOWN'].width / 2;
            let tothingcentery = tothing.worldy + tothing.sprites['DOWN'].height / 2;

            // distance to main character
            ret = Math.sqrt(Math.pow(tothingcenterx - this.centerx, 2) + Math.pow(tothingcentery - this.centery, 2));
        }else{
            ret = Math.sqrt(Math.pow(tothing.centerx - this.centerx, 2) + Math.pow(tothing.centery - this.centery, 2));
        }
        return ret;
    }

    leave(){
        this.here = false;
        if (this.sprites != null) {
            this.curanim.stop();
            this.gameevents.level.container.removeChild(this.container);
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

    startAnim(speed=0.1066) {
        if(this.sprites != null){
            if(this.curanim.playing){
                console.log("Thing is already playing an animation");
                return;
            }
            this.curanim.animationSpeed = speed;
            this.curanim.play();
        }
    }

    gotoAndPlay(frame, speed=0.1066) {
        if(this.curanim != null){
            this.curanim.gotoAndPlay(frame);
            this.curanim.animationSpeed = speed;
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
        let coordsx = Math.floor((this.worldx + 11) / this.gameevents.level.tiledimx);
        let coordsy = Math.floor((this.worldy + 16) / this.gameevents.level.tiledimy);
        return this.gameevents.level.bgtiles[0][coordsx][coordsy];
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