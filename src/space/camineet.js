
// -- 
// Alice's house
// -- 
export class House2 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg      = level.static_assets.get("bg");
        this.visits  = 0;

        this.dialog = "HERE IS THE HOME OF ALICE.";
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

        this.firstdialog = "I'M NEKISE. ONE HEARS LOTS OF STORIES, YOU KNOW, BUT SOME SAY THAT A FIGHTER NAMED ODIN LIVES IN A TOWN CALLED SCION. ALSO, I HAVE A LACONION POT GIVEN BY NERO. THAT WOULD BE HELPFUL IN YOUR TASK.";
        this.dialog = "I WISH I COULD HELP YOU MORE. I PRAY FOR YOUR SAFETY.";
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
        if(this.visits == 1){
            this.gevents.dialog_now(this.firstdialog + this.dialog);
        }else{
            this.gevents.dialog_now(this.dialog);
        }
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class House2


export class House3 {

    constructor(gevents, level){
        this.gevents = gevents;
        this.bg       = level.static_assets.get("bg");
        this.villager = level.static_assets.get("vill2");
        this.visits  = 0;

        this.firstdialog = "I'M SUELO. I KNOW HOW YOU MUST FEEL, DEAR, NO ONE CAN STOP YOU FROM DOING WHAT YOU KNOW YOU MUST DO. BUT IF YOU SHOULD EVER BE WOUNDED IN BATTLE, COME HERE TO REST."; 
        this.dialog = "PLEASE REST YOURSELF. YOU ARE WELCOME HERE ANY TIME";
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
        if(this.visits == 1){
            this.gevents.dialog_now(this.firstdialog + this.dialog);
        }else{
            this.gevents.dialog_now(this.dialog);
        }
        return false; // finished
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        this.gevents.level.app.stage.removeChild(this.bg);
        this.gevents.level.app.stage.removeChild(this.villager);
    }

}; // class House2