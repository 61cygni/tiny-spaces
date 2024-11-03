import * as PIXI from 'pixi.js'

let animations = new Map();

export function load_assets (static_img) {

    let key = "./ps1/wingeye.json";
    console.log("loadAnimatedSprites: ",key);
    PIXI.Assets.load(key).then((value) => {
        console.log("loadAnimatedSprites: ",value);
        animations.set("wingeye", value);
    });
    key = "./ps1/sworm.json";
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

}; // class Monster

class WingEye extends Monster {
    constructor(){
        super("wingeye", "wingeye");
    }
}

class Sworm extends Monster {
    constructor(){
        super("sworm", "sworm");
    }
}

let wingeye_instance = null;
let sworm_instance = null;

export function get_monster(name){
    if(name == "wingeye"){
        if(wingeye_instance == null){
            wingeye_instance = new WingEye();
            wingeye_instance.init();
        }
        return wingeye_instance;
    }
    if(name == "sworm"){
        if(sworm_instance == null){
            sworm_instance = new Sworm();
            sworm_instance.init();
        }
        return sworm_instance;
    }
    return null;
}
