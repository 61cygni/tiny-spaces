import * as BEING from '@spaced/being.js';
import * as TEXT from '@spaced/textcanvas.js';
import * as GLOBALS from '@spaced/globals.js';

export class Stranger extends BEING.Being {
    constructor(sheet, app) {
        super(sheet, app);
        this.name = "Stranger";

        this.conversationCanvas = new TEXT.TextCanvas(400, 600, {
            backgroundColor: 0x000000,
            backgroundAlpha: 0.8,
            textColor: 0xFFFFFF,
            fontSize: 14
        });

        this.items = new Map();

        this.conversationCanvas.setZIndex(GLOBALS.ZINDEX.DIALOG);
        this.conversationCanvas.setPosition(this.worldx - 500, this.worldy - 200);
        this.conversationCanvas.toggle();
    }

    arrive(x, y){
        super.arrive(x, y);
        if (window.gameLog) {
            window.gameLog.maininfo(this.name, "added to the game at position ("+x+", "+y+")");
        }
    }

    addItem(name, decsription){
        this.items.set(name, decsription);
    }

    getItem(name){
        return this.items.get(name);
    }    

    hasItem(name){
        return this.items.has(name);
    }

    removeItem(name){
        this.items.delete(name);
    }

    getItems(){
        return Array.from(this.items.values());
    }

    getItemNames(){
        return Array.from(this.items.keys());
    }

    getItemString(){
        return this.getItemNames().map((name, index) => `${index + 1}. ${name}`).join(', ');
    }

    tick(delta){
        this.conversationCanvas.setPosition(this.worldx - 500, this.worldy - 300);
        super.tick(delta);
    }

    reset(){
        this.items.clear();
        this.conversationCanvas.clear();
        super.init();
    }
}