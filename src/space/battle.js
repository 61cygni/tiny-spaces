import * as SCENE  from './scene.js';

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
    }

    init(){
        let bgtilenum = this.gevents.alis.curBGTile();
        console.log("BGTILE "+bgtilenum);
        if(bgtilenum == 158 || bgtilenum == 106){
            this.bg = this.gevents.level.static_assets.get("forest-bg");
        }else{
            this.bg = this.gevents.level.static_assets.get("field-bg");
        }
        super.init();
    }

}; // class BattleScene