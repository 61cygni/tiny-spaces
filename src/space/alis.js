import * as BEING  from './being.js';
import { Assets } from 'pixi.js';


const alicespritesheet = 'spritesheets/alice2.json';

class Alis extends BEING.Being{


    constructor(app, spritesheet, level) {
        super(app, spritesheet, level);
        this.name = 'Alis';
        this.items = new Map();
        this.maseta = 0;
        this.maxlife = 20;
        this.life = this.maxlife;

        this.strength = 16;
        this.agility  = 17;
        this.defense  = 15;

    }

};

var instance = null;

async function loadAlis(app){
    if(instance){
        return instance;
    }
    const sheet = await Assets.load(alicespritesheet);
    return new Alis(app, sheet, null);
}

export async function  getInstance(app){
    return await loadAlis(app);
}