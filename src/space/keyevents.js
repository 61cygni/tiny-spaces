
import { sound } from '@pixi/sound';

let Alis = null;
let gameevents = null;

export function init(gevents, alis){
    gameevents = gevents;
    Alis = alis;
}


window.addEventListener(
    "keydown", (event) => {

        // prevent browser from handling movement events
        if (event.code == 'Space' || 
            event.code == 'Escape' ||
            event.code == 'ArrowUp' ||
            event.code == 'ArrowRight' ||
            event.code == 'ArrowDown' ||
            event.code == 'ArrowLeft')
         {
            event.preventDefault();
        }

        if(event.code == 'Escape'){
            if(gameevents){
                gameevents.esc = true;
            }
        }

        if (gameevents && gameevents.pauseevents){
            return;
        }

        if (event.code == 'KeyM') {
            sound.toggleMuteAll()
        } 

        if(gameevents){
            if(gameevents.handle_event(event)){
                return; // handled by gameevents
            }
        }

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            Alis.goDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            Alis.goDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            Alis.goDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            Alis.goDir('LEFT');
        }

    }
);

window.addEventListener(
    "keyup", (event) => {

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            Alis.stopDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            // DOWN
            Alis.stopDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            // Right 
            Alis.stopDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            // Left 
            Alis.stopDir('LEFT');
        }
    }
);