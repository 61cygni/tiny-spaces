
import { sound } from '@pixi/sound';

let gameevents = null;
let textfocus = false;
let textinputhandler = null;

export function init(gevents){
    gameevents = gevents;
}

export function set_text_input_focus(flag){
    textfocus = flag;
}

export function register_input_handler(callme){
    textinputhandler = callme;
}

window.addEventListener(
    "keydown", (event) => {

        if(textfocus){
            return;
        }

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
                gameevents.handle_escape();
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

        if(!gameevents.alis){
            return;
        }

        let Alis = gameevents.alis;

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

        if(textfocus){
            console.log(event.code);
            if (event.code == "Enter") {
                if(textinputhandler){
                    textinputhandler(event.target);
                }
            }
            return;
        }

        if(!gameevents.alis){
            return;
        }

        let Alis = gameevents.alis;

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