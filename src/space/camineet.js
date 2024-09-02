// -----
// To add a prompt:
//  
// https://www.braintrust.dev/app/casado/p/spaces/prompts
//
// Slugs:
// 
// Intro: intro-blurb-a6a7
// Alice House :alice-home-9fee 
// Villager 1: camineet-man-1-d027
// House 5: camineet-house-5-c9f7 
// House 3: camineet-house3-6471 
//  
// -----
import * as BT  from './bt.js';

class CamineetScene {

    constructor(gevents, bg, slug, character = false, chat = false) {
        this.gevents = gevents;
        this.bg = gevents.level.static_assets.get(bg); // FIXME (better name)
        this.visits = 0;
        this.slug = slug; // BT prompt slug. If this is "" just use orig_dialog
        if(character){
            this.character = gevents.level.static_assets.get(character);
        }else{
            this.character = null;
        }
        this.chat = chat; // whether you can chat with this character

        this.finished = false;

        // original dialog from game. Should be set by child class
        this.orig_dialog = "";
    } // constructor

    // after first dialog, create input
    dialogdone() {
    }

    // once user has entered text, call prompt
    inputcallme(val){
            BT.bt(this.slug, val, this.dodialog.bind(this, val));
    }
    // dialog whilechatting
    dodialog(user, val) {
        if (!this.finished) {
            let str = "You: "+user+"\nVillager: "+val;
            this.gevents.dialog_now(str, "inputbottom", null, true);
        }
    }

    firstpromptdone(val) {
        if (!this.finished) {
            this.gevents.dialog_now(val, "inputbottom", this.dialogdone.bind(this), true);
        }
        if (!this.finished && this.chat) {
            this.gevents.input_now("", this.inputcallme.bind(this));
        }
    }

    // Called each time house is entered
    init() {
        this.finished = false;
        this.gevents.esc = false; // clean just in case. 
        this.visits += 1;
        if(this.slug != ""){
            BT.bt(this.slug, "", this.firstpromptdone.bind(this));
        }
    }

    // Scene to load once screen fades in 
    add_start_scene() {
        this.gevents.level.app.stage.addChild(this.bg);
        if(this.character){
            this.gevents.level.app.stage.addChild(this.character);
        }
        if(this.slug == ""){
            this.gevents.dialog_now(this.orig_dialog);
        }
    }

    // Tick called until scene is done.
    // Ret false = finished
    // Exit on ESC keypress
    tick() {
        if (this.gevents.esc) {
            // 
            this.gevents.esc = false;
            this.finished = true;
            return false; // finished
        }
        return true;
    }

    // remove scene fram app.stage to get back to level
    remove_scene() {
        if (this.chat) {
            this.gevents.input_leave();
        }
        this.gevents.level.app.stage.removeChild(this.bg);
        if(this.character){
            this.gevents.level.app.stage.removeChild(this.character);
        }
    }

}; // class Camineet house 

export class House1 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "bg", "camineet-house-1-0da4", "vill1");
        console.log("HOUSE! "+ this.slug);
        // original dialog from game
        this.orig_dialog = "I'M NEKISE. ONE HEARS LOTS OF STORIES, YOU KNOW, BUT SOME SAY THAT A FIGHTER NAMED ODIN LIVES IN A TOWN CALLED SCION. ALSO, I HAVE A LACONION POT GIVEN BY NERO. THAT WOULD BE HELPFUL IN YOUR TASK.";
    }
};

export class House2 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "bg", "alice-home-9fee");
        // original dialog from game
        this.orig_dialog = "HERE IS THE HOME OF ALICE.";
    }
};

export class House3 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "bg", "camineet-house3-6471", "vill2", true);
        // original dialog from game
        this.orig_dialog = "I'M SUELO. I KNOW HOW YOU MUST FEEL, DEAR, NO ONE CAN STOP YOU FROM DOING WHAT YOU KNOW YOU MUST DO. BUT IF YOU SHOULD EVER BE WOUNDED IN BATTLE, COME HERE TO REST."; 
    }
};

export class House4 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "bg", "", "vill1", false);
        // original dialog from game
        this.orig_dialog = "YOU NEED A DUNGEON KEY TO OPEN LOCKED DOORS";
    }
};

export class House5 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "bg", "camineet-house-5-c9f7", "vill4", true);
        // original dialog from game
        this.orig_dialog = "DO YOU KNOW ABOUT THE PLANETS OF THE ALGOL STAR SYSTEM?";
    }
};

export class Man1 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "city-bg", "", "vill3", true);
        // original dialog from game
        this.orig_dialog = "IN SOME DUNGEONS YOU WONT GET FAR WITHOUT A LIGHT";
    }
};

export class Man2 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "city-bg", "", "vill3", true);
        // original dialog from game
        this.orig_dialog = "THERE IS A SPACEPORT TO THE WEST OF CAMINEET";
    }
};

export class Man3 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "city-bg", "", "vill3", true);
        // original dialog from game
        this.orig_dialog = "IF YOU WANT TO MAKE A DEAL. YOU WANT TO HEAD TO THE PORT TOWN.";
    }
};

export class Man4 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "city-bg", "", "vill3", true);
        // original dialog from game
        this.orig_dialog = "THE CAMINEET RESIDENTIAL AREA IS UNDER MARTIAL LAW.";
    }
};

export class Guard1 extends CamineetScene {
    constructor(gevents) {
        super(gevents, "city-bg", "", "guard1", true);
        // original dialog from game
        this.orig_dialog = "YOU MAY NOT PASS.";
    }
};
