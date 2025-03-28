
// --
// Level logic:
//   - Hit on Jane to get the locket. Do talk to her again or she'll attack you
//   - Bill has a rock. Trade anything for the rock that isn't the locket 
//   - Once you have the locket, talk to Bob and get the black book.
//   - Trade Alice the rock for the bible  
//    - Take all these things to Gordy
// --


import * as LEVEL  from "@spaced/level.js";
import * as VILLAGER from "./villager.js";
import * as SCRIPT from "./script.js";
import * as ACTIONS from './npc_actions.js';

import { sound } from '@pixi/sound';

// --
// NPCs
// Probably don't need to be classes, but in the future could extend the functions to change behavior. 
// Right now behavior changes is all done via prompting. 
// --

class Nancy extends VILLAGER.Villager {
    constructor(gameevents){
        super("Nancy", "nancy-first-27c7", gameevents.level.spritesheet_map.get("villager2"), gameevents.level);
    }
}

class Jane extends VILLAGER.Villager {
    constructor(gameevents){
        super("Jane", "jane-first-a5e8", gameevents.level.spritesheet_map.get("villager3"), gameevents.level);
    }
}   

class Bob extends VILLAGER.Villager {
    constructor(gameevents){
        super("Bob", "bob-first-521e", gameevents.level.spritesheet_map.get("villager4"), gameevents.level);
    }
}

class Bill extends VILLAGER.Villager {
    constructor(gameevents){
        super("Bill", "bill-first-3a38", gameevents.level.spritesheet_map.get("villager5"), gameevents.level);
    }
}

class Alice extends VILLAGER.Villager {
    constructor(gameevents){
        super("Alice", "alice-first-218e", gameevents.level.spritesheet_map.get("villager6"), gameevents.level);
    }
}

class Gordy extends VILLAGER.Villager {
    constructor(gameevents){
        super("Gordy", "gordy-first-16e8", gameevents.level.spritesheet_map.get("villager7"), gameevents.level);
    }
}

class Jill extends VILLAGER.Villager {
    constructor(gameevents){
        super("Jill", "jill-first-4720", gameevents.level.spritesheet_map.get("villager8"), gameevents.level);
    }
}

class Chicken extends VILLAGER.Villager {
    constructor(gameevents){
        super("Chicken", "", gameevents.level.spritesheet_map.get("chicken"), gameevents.level);

        // delete all actions except WALK and THINK
        this.Action = {
            'WALK': new ACTIONS.WalkAction(),
            'THINK': new ACTIONS.ThinkAction()
        };
        this.numActions = Object.keys(this.Action).length;

        // loop through all animations and scale them down by 2
        for(const key in this.sprites){
            console.log(key);
            this.sprites[key].scale.set(.5);
        }

        // slow down walking speed
        this.movedelta = .4;
    }

    getChatResponse(message){
        sound.play('chicken');
        return "....";
    }
}



export function register_villagers(gameevents){
     // Create a bunch of villagers 
    let nancy = new Nancy(gameevents);
    nancy.addItem("blackmask", "A black mask with a red eye.");
    gameevents.level.addBeing(nancy);
    nancy.arrive(1000, 400);

    let jane = new Jane(gameevents);
    jane.addItem("locket", "A locket with a picture of a young woman.");
    gameevents.level.addBeing(jane);
    jane.arrive(800, 800);

    let bob = new Bob(gameevents);
    bob.addItem("blackbook", "An unadorned, black book.");
    gameevents.level.addBeing(bob);
    bob.arrive(400, 400);

    let bill = new Bill(gameevents);
    bill.addItem("rock", "A smooth, round rock.");
    gameevents.level.addBeing(bill);
    bill.arrive(400, 800);

    let alice = new Alice(gameevents);
    alice.addItem("Medallion", "A small, old medallion.");
    alice.addItem("bible", "A tattered, old bible.");
    gameevents.level.addBeing(alice);
    alice.arrive(800, 400);

    let gordy = new Gordy(gameevents);
    gordy.addItem("Gold medal", "For winners");
    gordy.addItem("Silver medal", "For almost winners");
    gordy.addItem("Cupie doll", "For everyone");
    gameevents.level.addBeing(gordy);
    gordy.arrive(1200, 400);

    let jill = new Jill(gameevents);
    jill.addItem("key", "A small, old key.");
    gameevents.level.addBeing(jill);
    jill.arrive(1200, 800);

    let chicken = new Chicken(gameevents);
    chicken.addItem("Chicken", "A chicken.");
    gameevents.level.addBeing(chicken);
    chicken.arrive(600, 1400);

    let chicken2 = new Chicken(gameevents);
    chicken2.addItem("Chicken", "A chicken.");
    gameevents.level.addBeing(chicken2);
    chicken2.arrive(400, 1400);

    let chicken3 = new Chicken(gameevents);
    chicken3.addItem("Chicken", "A chicken.");
    gameevents.level.addBeing(chicken3);
    chicken3.arrive(500, 1400);

    let chicken4 = new Chicken(gameevents);
    chicken4.addItem("Chicken", "A chicken.");
    gameevents.level.addBeing(chicken4);
    chicken4.arrive(300, 1400);

    let chicken5 = new Chicken(gameevents);
    chicken5.addItem("Chicken", "A chicken.");
    gameevents.level.addBeing(chicken5);
    chicken5.arrive(100, 1400);
    
}

export function spritesheets(){
    return [new LEVEL.Sprite("villager2", "./spritesheets/villager2.json"),
        new LEVEL.Sprite("villager3", "./spritesheets/villager3.json"),
        new LEVEL.Sprite("villager-jane", "./spritesheets/villager-jane.json"),
        new LEVEL.Sprite("villager4", "./spritesheets/villager4.json"),
        new LEVEL.Sprite("villager5", "./spritesheets/villager5.json"),
        new LEVEL.Sprite("villager6", "./spritesheets/villager6.json"),
        new LEVEL.Sprite("villager7", "./spritesheets/villager7.json"),
        new LEVEL.Sprite("villager8", "./spritesheets/villager8.json"),
        new LEVEL.Sprite("chicken", "./spritesheets/chicken.json"),
    ];
}

export function reset_stranger(stranger) {
    stranger.reset();
    stranger.setFocus(true);

    stranger.addItem("Leather Pouch", "A small, old leather pouch.");
    stranger.addItem("Old Key", "A small, old key.");
    stranger.addItem("necklace", "A beautiful necklace.");
    
    // stranger.addItem("bible", "A tattered, old bible.");
    // stranger.addItem("blackbook", "An unadorned, black book.");
    // stranger.addItem("locket", "An unadorned, black book.");

    stranger.setFocus(true);

    return stranger;
}

// --
// Primary game rules based on who has what 
// --
export function check_item_logic(impl){
    console.log("check_item_logic");
    // if the character has the black book but not the locket, then the character becomes cursed
    if(impl.gameevents.mainchar.hasItem("blackbook") && !impl.gameevents.mainchar.hasItem("locket")){
        impl.gameOver(SCRIPT.GAME_OVER_BOOK_BLURB);
    }
    if(impl.gameevents.mainchar.hasItem("blackmask")){
        impl.gameOver(SCRIPT.GAME_OVER_BLACKMASK_BLURB);
    }

    if(impl.chatting_with_villager.name == "Gordy" && 
        impl.chatting_with_villager.hasItem("blackbook") && 
        impl.chatting_with_villager.hasItem("bible")){ 
        impl.victory(SCRIPT.GAME_VICTORY_BLURB);
    }
}

export function attack_logic(impl, stranger){
    console.log("attack_logic");
    impl.gameOver(SCRIPT.GAME_OVER_ATTACK_BLURB);
}