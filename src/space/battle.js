import { Ticker } from '@pixi/ticker';
import * as PIXI from 'pixi.js'
import * as SCENE  from './scene.js';
import * as BeachBG from './anim-bg.js';
import * as Monsters from './palma-monsters.js';
import * as DIALOG from './dialog.js';


let timer_fired = false;


class BattleTimer {
    constructor(){
        this.elapsedTime = 0;
        this.n = 0;
    }

    wait_n_seconds(n, callback) {

        this.n = n; // seconds to wait before firing
        this.ticker = new Ticker();
        this.ticker.add(this.impl_wait_3_seconds.bind(this, callback), this);
        this.ticker.start();
        
    }
    
    impl_wait_3_seconds(callback, delta) {
        this.elapsedTime += delta;
        if (this.elapsedTime >= this.n * 50) {
            console.log("firing"+this.elapsedTime);
            callback();
            this.ticker.stop();
            this.ticker.destroy();
        }
    }

}

export class BattleScene extends SCENE.InteractiveScene {

    constructor(gevents) {
        super(gevents, 
            {
                bg:"field-bg", 
                music: "battle",
                slug2: "palma-battle-b18c",
                chat: true,
                basemusic: "ps1-palma",
                orig_dialog: "AI: Oh no, we're being attacked! What would you like to do?",
            });

        this.beach_bg = BeachBG.get_beach_bg(gevents); // grab singleton instance
    }

    attack(action){
        console.log("Battle ATTACK ");
    }

    run(action){
        console.log("Battle RUN ");
        console.log(this);
        this.gevents.esc = true;
    }

    init(){

        this.register_action("attack", this.attack.bind(this));
        this.register_action("run", this.run.bind(this));


        let bgtilenum = this.gevents.alis.curBGTile();
        console.log("BGTILE "+bgtilenum);
        if(bgtilenum == 105 || bgtilenum == 157){
            this.bg = new PIXI.Container();
            this.bg.addChild(this.gevents.level.static_assets.get("field-bg"));
        }else if(bgtilenum == 158 || bgtilenum == 106){
            this.bg = new PIXI.Container();
            this.bg.addChild(this.gevents.level.static_assets.get("forest-bg"));
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

        // grab monster list and pick one at random
        let monsters = Monsters.get_monsters(); // sington instance so OK to get each call 
        let ran = Math.floor(Math.random() * monsters.length);
        let monster = monsters[ran];
        this.character = monster.sprite;
        console.log("MONSTER "+monster.sprite);

        let namedialog = new DIALOG.Dialog(this.gevents.level, "", false, 'top', null, {fontsize:14});
        namedialog.create_static(monster.name, 0, 0);
        let hpdialog = new DIALOG.Dialog(this.gevents.level, "", false, 'top', null, {fontsize:14});
        let hpstring = "HP: "+monster.hp;
        ran = Math.floor(Math.random() * monster.num);
        for(let i = 1; i < ran; i++){
            hpstring += "\nHP: "+monster.hp;
        }
        hpdialog.create_static(hpstring, 0, 0);
        hpdialog.container.x = 640 - hpdialog.container.width;
        namedialog.container.x = 640 - (hpdialog.container.width + namedialog.container.width);
        this.bg.addChild(namedialog.container);
        this.bg.addChild(hpdialog.container);

        super.init();
    }

    tick(delta){

        if(!timer_fired){
            timer_fired = true;
            this.character.play();
            new BattleTimer().wait_n_seconds(5, () => {
                this.character.stop();
            });
        }

        return super.tick(delta);
    }




}; // class BattleScene