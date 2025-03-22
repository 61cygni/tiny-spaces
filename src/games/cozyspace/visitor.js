import * as BEING from '@spaced/being.js';
import * as SCREEN from '@spaced/screen.js';

import * as PIXI from 'pixi.js';

export class Visitor extends BEING.Being {
    constructor(sheet, app) {
        super(sheet, app);
        this.name = "Visitor";
        this.blocking_layers = [1]; // only block on second obj layer 
    }

    arrive(x, y){
        super.arrive(x, y);
    }
}

let instance = null;

export async function Instance(){
    if(!instance){
        const sheet = await PIXI.Assets.load("./spritesheets/villager4.json");
        instance = new Visitor(sheet, SCREEN.instance().app);
    }
    return instance;
}