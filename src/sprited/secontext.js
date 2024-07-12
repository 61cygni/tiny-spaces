import * as PIXI from 'pixi.js'
import * as CONFIG from './seconfig.js'

var ContextCreate = (function(){

    function ContextSingleton() {
        this.tilesetpxw = 0;
        this.tilesetpxh = 0;
        this.tilesettilew = 0;
        this.tilesettileh = 0;
        this.MAXTILEINDEX = 0;
        this.tile_index = 0;
        this.selected_tiles = []; // current set of selected tiles
        this.tiledimx = CONFIG.DEFAULTILEDIMX ; // px
        this.tiledimy = CONFIG.DEFAULTILEDIMY; // px
        this.leveldimx = CONFIG.DEFAULTLEVELDIMX ; // px
        this.leveldimy = CONFIG.DEFAULTLEVELDIMY; // px
        this.dkey = false;   // is 'd' key depressed? (for delete)
        this.fudgetiles = [];
        this.g_layers = []; // level layers

    }

    var instance;
    return {
        getInstance: function(){
            if (instance == null) {
                instance = new ContextSingleton();
                // Hide the constructor so the returned object can't be new'd...
                instance.constructor = null;
            }
            return instance;
        }
   };
})();

// global shared state between all panes
export let g_ctx = ContextCreate.getInstance();