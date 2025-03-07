
import * as VILLAGER from "./villager.js";
import * as SCRIPT from "./script.js";

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

export function register_villagers(gameevents){
     // Create a bunch of villagers 
    let nancy = new Nancy(gameevents);
    nancy.addItem("Black mask", "A black mask with a red eye.");
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
    alice.addItem("Bible", "A tattered, old bible.");
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
}

// --
// Primary game rules based on who has what 
// --
export function check_game_logic(impl){
    console.log("check_game_logic");
    // if the character has the black book but not the locket, then the character becomes cursed
    if(impl.gameevents.mainchar.hasItem("blackbook") && !impl.gameevents.mainchar.hasItem("locket")){
        impl.gameOver(SCRIPT.GAME_OVER_BOOK_BLURB);
    }
}