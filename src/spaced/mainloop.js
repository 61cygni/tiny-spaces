// mainloop.js
//
// Helper functions for the main loop of any game. It handles:
// - Loading all assets (images, sounds, etc)
// - Loading all levels
// - loading all sprites
//
// I also maintains a map of names to levels. And a basic
// game loop handling transitions between levels

import * as PIXI from 'pixi.js'
import { Ticker } from '@pixi/ticker';

import * as SCREEN from '@spaced/screen.js';
import * as LEVEL  from '@spaced/level.js';
import * as GAME   from '@spaced/gameevents.js';
import * as KEY    from '@spaced/keyevents.js';


// Main character
let mainchar = null;
// map of level name to level
let levelmap = new Map();
// pixi app
let app = null;

export function initApp(width, height, canvasname){
    app = new PIXI.Application();
    app.init({ width: width, height: height, canvas: document.getElementById(canvasname) });
    SCREEN.initScreen(width, height, canvasname);
}

// OK these are annoyingly magic. But the current convention is to use
// lavelname-labelname when descring an entry point to a level

function getLevelName(tag){
    return tag.split('-')[0];
}
function getLabelName(tag){
    return tag.split('-')[1];
}

function maincharEnterLevel(location, gameevents) {
    let levelname = getLevelName(location);
    let labelname = getLabelName(location);

    console.log("Entering level " + levelname + ' : ' + labelname);

    let level = levelmap.get(levelname);

    if (level.details.type == "level") {
        mainchar.level = level;
        gameevents.reset(level, mainchar);
        level.arrive();

        let start = level.coordsdict.get(labelname);
        if (start != null) {
            console.log("mainchar start " + start[0] + " : " + start[1]);
            mainchar.arrive(start[0] * level.tiledimx, start[1] * level.tiledimy - 14);
        }else{
            console.log("Error: No start location for " + labelname);
        }
    }else{
        // Splash screens don't need mainchar 
        gameevents.reset(level, null);
        level.arrive();
    }

    // Fade in 
    gameevents.add_to_tick_event_queue(new GAME.FadeIn(gameevents));

    // call level initialization when entering
    level.details.initonenter(gameevents);

    return level;
}

// Call this first with main character of class Being
// and an array of levels.

export async function initAndLoadLevels(mainbeing, levels) {
    if(!app){
        console.log("Error: App not initialized");
        throw new Error("App not initialized");
    }

    mainbeing.app = app;
    mainchar = mainbeing;

    //  Preload all levels this requires a bunch of async calls, so kick off all of them
    //    and then wait for them all to complete before running the main loop 

    let promises = levels.map((leveldetails) => {
        return LEVEL.loadSync(app, leveldetails);
    }
    );

    await Promise.all(promises).then((levels) => {
        levels.map((alevel) => {
            console.log("Loaded level: " + alevel.name);
            levelmap.set(alevel.name, alevel)
        });
    }
    );

}

// Call this to start the main loop. Must be called after initAndLoadLevels
// finishes.
export function initMainLoop(startlocation) {
    // game event harness
    let gameevents = new GAME.GameEvents(mainchar);

    // initialize keyboard handler
    KEY.init(gameevents, mainchar);
    //register_text_input();

    const ticker = new Ticker();

    // mainchar enters first level
    let level = maincharEnterLevel(startlocation, gameevents);

    // Main loop
    ticker.add((delta) => {
        mainchar.tick(delta);
        let nextlevel = gameevents.tick(delta);
        if (nextlevel != null) {

            if (mainchar.hp <= 0) {
                console.log("mainchar is dead. Going to title screen");
                nextlevel = "Title-start1";
            }

            ticker.stop();
            console.log("Leaving " + getLevelName(nextlevel));
            mainchar.leave();
            level.leave();

            level = maincharEnterLevel(nextlevel, gameevents);
            ticker.start();
        }
    });

    ticker.speed = .2;
    ticker.start();
}

// Placeholder for using HTML input field for text input
// function get_input(target){
//     console.log(target.value);
//     target.value = "";
// }
// const input = document.getElementById('myInput');
// function register_text_input() {
// 
//     input.addEventListener('focus', () => {
//         KEY.set_text_input_focus(true);
//         console.log("FOCUS!");
//         input.parentNode.classList.add('focused');
//     });
// 
//     input.addEventListener('blur', () => {
//         console.log("NOT FOCUS!");
//         KEY.set_text_input_focus(false);
//         if (!input.value) {
//             input.parentNode.classList.remove('focused');
//         }
//     });
// 
//     KEY.register_input_handler(get_input);
// }