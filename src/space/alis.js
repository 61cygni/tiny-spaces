import * as BEING  from './being.js';
import { Assets } from 'pixi.js';


const alicespritesheet = 'spritesheets/alice2.json';

class Alis extends BEING.Being{

    constructor(app, spritesheet, level) {
        super(app, spritesheet, level);
        this.name = 'Alis';
        this.items = []; 
        this.maseta = 0;
        this.maxhealth = 20;
        this.health = this.maxhealth;
        this.explevel = 0; //experience level

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
    instance = new Alis(app, sheet, null);
    return instance; 
}

export async function  getInstance(app){
    return await loadAlis(app);
}

export function rawInstance(){
    return instance;
}