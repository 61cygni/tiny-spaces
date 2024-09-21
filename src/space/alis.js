import * as BEING  from './being.js';

export class Alis extends BEING.Being{

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