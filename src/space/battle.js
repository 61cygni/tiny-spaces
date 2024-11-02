import * as PIXI from 'pixi.js'
import * as SCENE  from './scene.js';
import * as BeachBG from './anim-bg.js';

export class BattleScene extends SCENE.InteractiveScene {

    constructor(gevents, animations) {
        super(gevents, 
            {
                bg:"field-bg", 
                character: "guard1",
                music: "battle",
                basemusic: "ps1-palma",
                orig_dialog: "FIGHT!!",
            });
        this.animations = animations;

        this.beach_bg = BeachBG.get_beach_bg(gevents); // grab singleton instance
    }

    init(){
        let bgtilenum = this.gevents.alis.curBGTile();
        console.log("BGTILE "+bgtilenum);
        if(bgtilenum == 105 || bgtilenum == 157){
            this.bg = this.gevents.level.static_assets.get("field-bg");
        }else if(bgtilenum == 158 || bgtilenum == 106){
            this.bg = this.gevents.level.static_assets.get("forest-bg");
        }else if(bgtilenum == 112 || bgtilenum == 535 || bgtilenum == 537 || bgtilenum == 483 
            || bgtilenum == 484)
        {
            console.log("Setting beach bg");
            console.log(this.beach_bg.container);
            this.bg = this.beach_bg.container;
        }else{
            console.log("UNKNOWN BG TILE "+bgtilenum);
            this.bg = this.beach_bg.container;
        }

        let wingeye = this.animations.get("wingeye");
        let ctile  = new PIXI.AnimatedSprite(wingeye.animations["row0"]);
        ctile.width = 116;
        ctile.x = 640/2 - ctile.width/2;
        ctile.height = 116;
        ctile.y = 480/2 - ctile.height/2;
        ctile.animationSpeed = .10;
        ctile.play();
        this.character = ctile;

        super.init();
    }



}; // class BattleScene