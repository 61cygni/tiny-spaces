// --
// Animated backgrounds
// --
import * as PIXI from 'pixi.js'
import * as LEVEL  from '@spaced/level.js';

let beach_instance = null;
let animations = new Map();

export function load_assets (static_img) {

    static_img.push(new LEVEL.StaticImage("beach-bg",      "./img/beach-bg.png",   640, 480, 0,0));

    let key = "./sprites/beach-bg-anim.json";
    console.log("loadAnimatedSprites: ",key);
    PIXI.Assets.load(key).then((value) => {
        console.log("loadAnimatedSprites: ",value);
        animations.set("beach-wave", value);
    });

}

class BeachBG {

    constructor(gevents){
        this.gevents = gevents;
        this.container = new PIXI.Container();

        let bg = this.gevents.level.static_assets.get("beach-bg");
        if(bg == null){
            console.log("Error: beach-bg not found");
            return;
        }
        this.container.addChild(bg);
        this.add_animations();

    }

    // --
    // Animations are 224 pixels high and 64 pixels wide
    // First add water, and then waves at the bottom of the image 
    // -- 
    add_animations(){
        let height = 224; // heigh of wave animation 
        let anim = animations.get("beach-wave");
        console.log("anim", anim);
        for (let i = 0; i < 10; i++) {
            let ctile  = new PIXI.AnimatedSprite(anim.animations["row0"]);
            let ctile2 = new PIXI.AnimatedSprite(anim.animations["row1"]);
            ctile.x = 64 * i;
            ctile2.x = 64 * i;
            ctile.y = 480 - height;
            ctile2.y = 480 - height;
            ctile.height = height;
            ctile2.height = height;
            ctile.width = 64;
            ctile2.width = 64;
            ctile.animationSpeed = .05;
            ctile2.animationSpeed = .05;
            ctile.autoUpdate = true;
            ctile2.autoUpdate = true;
            ctile.play();
            ctile2.play();
            this.container.addChild(ctile2);
            this.container.addChild(ctile);
        }
    }

}; // class BeachBG

// --
// Return singleton instance
// --
export function get_beach_bg(gevents){
    if(beach_instance == null){
        beach_instance = new BeachBG(gevents);
    }
    return beach_instance;
};
