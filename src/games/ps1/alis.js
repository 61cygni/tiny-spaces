import { Assets } from 'pixi.js';

import * as BEING  from '@spaced/being.js';

const alicespritesheet = './sprites/alice2.json';

class Alis extends BEING.Being{

    constructor(spritesheet, level) {
        super(spritesheet, level);
        this.reset();
        this.setFocus(true);
    }

    reset(){
        this.name = 'Alis';
        this.items = []; 
        this.maseta = 0;

        this.level = 1;
        this.exp = 0;
        // this.maxhp = 1;
        this.maxhp = 16;
        this.hp = this.maxhp;
        this.health = this.maxhealth;
        this.explevel = 0; //experience level
        this.maxmp = 0;
        this.mp = this.maxmp;  // magic points
        this.attack = 8;
        this.defense = 8;
        this.spells = [];
    }

};

var instance = null;

async function loadAlis(){
    if(instance){
        return instance;
    }
    const sheet = await Assets.load(alicespritesheet);
    instance = new Alis(sheet, null);
    return instance; 
}

export async function  getInstance(){
    return await loadAlis();
}

export function rawInstance(){
    return instance;
}

/*
https://shrines.rpgclassics.com/sms/ps1/characters.shtml#google_vignette

Level	ExpPts.	HitPts.	MagPts.	AttVal.	DefVal.	Spells
1   0	16	0	8	8	-
2	20	20	0	10	11	-
3	50	25	0	12	15	-
4	100	34	4	14	20	Heal
5	230	45	6	15	24	Bye
6	330	54	8	18	28	Chat
7	450	66	10	21	30	-
8	600	76	12	23	33	-
9	800	81	13	24	40	-
10	1050	93	14	25	51	-
11	1300	99	15	27	60	-
12	1700	111	16	30	64	Fire
13	2200	123	18	31	68	-
14	2800	132	20	34	75	Rope
15	3500	140	22	36	80	-
16	4100	153	22	38	85	Fly
17	5000	159	24	40	90	-
18	6000	166	24	41	96	-
19	7200	173	25	43	100	-
20	8500	182	25	44	107	-
21	10000	187	26	46	110	-
22	12000	192	26	48	112	-
23	14500	200	27	49	113	-
24	17500	204	28	50	114	-
25	23000	208	29	51	115	-
26	30000	210	29	52	119*	-
27	38000	212	30	53	117	-
28	45000	214	30	54	118	-
29	52000	216	32	55	119	-
30	63000	218	32	56	120	-
*/