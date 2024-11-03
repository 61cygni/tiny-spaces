import * as PIXI from 'pixi.js'
import * as SCENE  from './scene.js';
import * as BeachBG from './anim-bg.js';
import * as Monsters from './palma-monsters.js';

export class BattleScene extends SCENE.InteractiveScene {

    constructor(gevents) {
        super(gevents, 
            {
                bg:"field-bg", 
                character: "guard1",
                music: "battle",
                basemusic: "ps1-palma",
                orig_dialog: "FIGHT!!",
            });

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

        //if random number is even, use wingeye, else use sworm
        let random = Math.floor(Math.random() * 10);
        if (Math.floor(Math.random() * 10) % 2 == 0) {
            let wingeye = Monsters.get_monster("wingeye");
            this.character = wingeye.sprite;
        } else {
            let sworm = Monsters.get_monster("sworm");
            this.character = sworm.sprite;
        }

        super.init();
    }



}; // class BattleScene