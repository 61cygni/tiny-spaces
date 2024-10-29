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
        console.log("BGTILE "+this.gevents.alis.curBGTile());
        super.init();
    }

}; // class BattleScene