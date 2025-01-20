import * as PIXI from 'pixi.js'

let animations = new Map();

export function load_assets (static_img) {

    let key = "./sprites/wingeye.json";
    console.log("loadAnimatedSprites: ",key);
    PIXI.Assets.load(key).then((value) => {
        console.log("loadAnimatedSprites: ",value);
        animations.set("wingeye", value);
    });
    key = "./sprites/sworm.json";
    console.log("loadAnimatedSprites: ",key);
    PIXI.Assets.load(key).then((value) => {
        console.log("loadAnimatedSprites: ",value);
        animations.set("sworm", value);
    });

}

class Monster {

    constructor(name, spritename){
        this.name = name;
        this.spritename = spritename;
        this.sprite = null;
        this.hp = 0;
        this.init();
    }

    init() {
        let monster = animations.get(this.spritename);
        let ctile = new PIXI.AnimatedSprite(monster.animations["row0"]);
        ctile.width = 116;
        ctile.x = 640 / 2 - ctile.width / 2;
        ctile.height = 116;
        ctile.y = 480 / 2 - ctile.height / 2;
        ctile.animationSpeed = .10;
        this.sprite = ctile;
    }

    // stats is an object with the following properties:
    // HP, ATP, DFP, Exp, Mes, Num, Run, Trp, Win, T, C, R, P, M
    set_stats(stats){
        this.hp = stats.HP;
        this.atp = stats.ATP;
        this.dfp = stats.DFP;
        this.exp = stats.Exp;
        this.mes = stats.Mes;
        this.num = stats.Num;
        this.run = stats.Run;
        this.trip = stats.Trp;
        this.win = stats.Win;
        this.t = stats.T;
        this.c = stats.C;
        this.r = stats.R;
        this.p = stats.P;
        this.m = stats.M;
    }

}; // class Monster

/*
Name      HP   ATP  DFP  Exp  Mes  Num  Run  Trp  Win   T  C  R  P  M Special
WING EYE  11   12   10   2    6    6    127  15    -   -  y  y  y 

*/

class WingEye extends Monster {
    constructor(){
        super("wingeye", "wingeye", );
        this.set_stats({HP:11, ATP:12, DFP:10, Exp:2, Mes:6, Num:6, Run:127, Trp:15, Win:false, T:false, C:true, R:true, P:true, M:false});
    }
}

/*
Name      HP   ATP  DFP  Exp  Mes  Num  Run  Trp  Win   T  C  R  P  M Special
SWORM     8    13   9    2    3    8    255  12         -  -  y  y  y 

*/

class Sworm extends Monster {
    constructor(){
        super("sworm", "sworm");
        this.set_stats({HP:8, ATP:13, DFP:9, Exp:2, Mes:3, Num:8, Run:255, Trp:12, Win:false, T:false, C:false, R:true, P:true, M:false});
    }
}

let palma_monsters = null;

let wingeye_instance = null;
let sworm_instance = null;

export function get_monsters(){
    if(palma_monsters == null){
        palma_monsters = []; 
        palma_monsters.push(new WingEye());
        palma_monsters.push(new Sworm());
    }
    return palma_monsters; // return singleton map of monsters
}
