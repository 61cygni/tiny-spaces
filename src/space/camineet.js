
// -- 
// Alice's house
// -- 
export class House2 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg      = level.static_assets.get("bg");
        this.visits  = 0;

        this.dialog = "This is Alice's home.";
    }

    init () {
        this.visits += 1;
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
    }

    // Tick called until finish
    tick () {
        this.gevents.dialog_now(this.dialog);
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
    }

}; // class House2

// -- 
// House 1 
// -- 
export class House1 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("bg");
        this.villager = level.static_assets.get("vill1");
        this.visits  = 0;

        this.dialog = "I wish I could help you more. I pray for your safety.";
    }

    init () {
        this.visits = this.visits + 1; 
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        this.gevents.level.app.stage.addChild(this.villager);
    }

    // Tick called until finish
    tick () {
        const text = this.dialog + " You have been here " + this.visits + " times.";
        this.gevents.dialog_now(text);
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class House2