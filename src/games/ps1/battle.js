import { Ticker } from '@pixi/ticker';
import * as PIXI from 'pixi.js'

import * as SCENE  from '@spaced/scene.js';
import * as DIALOG from '@spaced/dialog.js';

import * as Monsters from './palma-monsters.js';
import * as BeachBG from './anim-bg.js';

import { sound } from '@pixi/sound';



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

        this.battlefinished = false;
        this.monsters = [];
        this.namedialog = null;
        this.hpdialog = null;
    }

    do_attack_round(){
        if(this.finished){
            return;
        }
        let first = Math.floor(Math.random() * 2);
        if(first == 0){
            this.do_player_attack(this.do_monster_attack.bind(this, this.next_round.bind(this)));
        }else{
            this.do_monster_attack(this.do_player_attack.bind(this, this.next_round.bind(this)));
        }
    }

    next_round(){
        if(this.battlefinished){
            return;
        }
        if (this.gevents.a.hp <= 0) {
            console.log("A is dead");
            // this.gevents.clear_dialogs();
            // this.gevents.input_leave();
            this.gevents.dialog_stream("\nA DIED. mainchar'S HOPE CAN NOT OVERCOME THE POWER OF LASSIC. THE ADVENTURE IS OVER", 
                'bottom',
                {
                    appendcb: () => {
                        console.log("dialog cb");
                        this.battlefinished = true;
                    }
                }
            );
            this.gevents.dialog_stream_done();
            sound.stopAll();
            sound.play('gameover');
            return;
        }

        if(this.monsters_dead()){
            console.log("All monsters are dead");
            this.gevents.dialog_now("You have defeated all the monsters!", "bottom",
                () => {
                    this.battlefinished = true;
                }
            );
            this.gevents.esc = true;
            return;
        }

        this.gevents.dialog_stream("A has "+this.gevents.mainchar.hp+" HP left.\nWhat would you like to do?", 'inputbottom', null, true);
    }

    monsters_dead(){
        for(let i = 0; i < this.monsters.length; i++){
            if(this.monsters[i].hp > 0){
                return false;
            }
        }
        return true;
    }

    do_player_attack(callback){
        console.log("do_player_attack");
        if(this.finished){
            return;
        }

        // TODO: show animation of player attack
        let dmg = Math.floor(Math.random() * 10);
        let monster = Math.floor(Math.random() * this.monsters.length);

        // if we chose a dead monster, pick the first live one
        if(this.monsters[monster].hp <= 0){
            for(let i = 0; i < this.monsters.length; i++){
                if(this.monsters[i].hp > 0){
                    monster = i;
                    break;
                }
            }
        }

        new BattleTimer().wait_n_seconds(2, () => {

            if (this.gevents.a.hp > 0) {
                this.monsters[monster].hp -= dmg;
                this.gevents.dialog_stream("You hit the monster for " + dmg + " damage!\n", 'inputbottom', null, true);
                if (this.monsters[monster].hp <= 0) {
                    console.log("Monster is dead");
                    this.monsters[monster].hp = 0;
                }
                this.update_monster_hud();
                // Call next function when dialog is done
                this.gevents.dqueue[0].appendcallback = () => {
                    new BattleTimer().wait_n_seconds(2, callback);
                };
            } else {
                if (callback) {
                    callback();
                }
            }

        });

    }

    do_monster_attack(callback){
        console.log("do_monster_attack");
        if(this.finished){
            return;
        }
        this.character.play();
        let dmg = Math.floor(Math.random() * 10);
        new BattleTimer().wait_n_seconds(2, () => {
            this.gevents.dialog_stream("The monster hit you for "+dmg+" damage!\n", 'inputbottom', null, true);
            this.gevents.a.hp -= dmg;
            this.character.stop();
            this.gevents.dqueue[0].appendcallback = () => {
                new BattleTimer().wait_n_seconds(2, callback);
            };

            // if(callback){
            //     callback();
            // }
        });
    }

    attack(action){
        console.log("Battle ATTACK ");
        this.do_attack_round();
    }

    run(action){
        console.log("Battle RUN ");
        console.log(this);
        this.gevents.esc = true;
    }

    choose_and_setup_monster(){
        this.monsters = [];

        // grab monster t and pick one at random
        let monsters = Monsters.get_monsters(); // sington instance so OK to get each call 
        let ran = Math.floor(Math.random() * (monsters.length));

        console.log("Choosing monster: "+ran);

        let monster = monsters[ran];
        this.character = monster.sprite;

        // pick a random number of monsters
        ran = Math.floor(Math.random() * monster.num) + 1;

        console.log("Monster encountered: "+monster.name+" ["+ran+"]");

        for(let i = 0; i < ran; i++){
            // shallow copy monster
            let m = Object.assign({}, monster);
            console.log(m);
            this.monsters.push(m);
        }
    }

    update_monster_hud() {

        if(this.namedialog){
            this.bg.removeChild(this.namedialog.container);
            this.namedialog.container.destroy();
        }
        if(this.hpdialog){
            this.bg.removeChild(this.hpdialog.container);
            this.hpdialog.container.destroy();
        }

        this.namedialog = new DIALOG.Dialog(this.gevents.level, "", false, 'top', null, { fontsize: 14 });
        this.namedialog.create_static(this.monsters[0].name, 0, 0);

        this.hpdialog = new DIALOG.Dialog(this.gevents.level, "", false, 'top', null, { fontsize: 14 });
        let hpstring = "HP: " + this.monsters[0].hp;

        for (let i = 1; i < this.monsters.length; i++) {
            hpstring += "\nHP: " + this.monsters[i].hp;
        }
        this.hpdialog.create_static(hpstring, 0, 0);
        this.hpdialog.container.x = 640 - this.hpdialog.container.width;
        this.namedialog.container.x = 640 - (this.hpdialog.container.width + this.namedialog.container.width);
        this.bg.addChild(this.namedialog.container);
        this.bg.addChild(this.hpdialog.container);
    }

    init(harness){

        this.register_action("attack", this.attack.bind(this));
        this.register_action("run", this.run.bind(this));


        let bgtilenum = this.gevents.mainchar.curBGTile();
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

        this.choose_and_setup_monster();
        this.update_monster_hud();

        super.init(harness);
    }

    tick(delta){

        if(this.battlefinished){

            // A is dead, clean up and return to title screen
            if(this.gevents.a.hp <= 0){
                console.log("BattleScene tick: a is dead");
            }
            this.bg.removeChildren();
            this.gevents.a.reset();
            // have staticbackground return to the title screen 
            this.bgharness.tick_return_new_level = "Title-start1";

            return false; // battle over, fade out 
        }

        return super.tick(delta);
    }




}; // class BattleScene