
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

        if(!gameevents.mainchar){
            return;
        }

        let mainchar = gameevents.mainchar;

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            mainchar.goDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            mainchar.goDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            mainchar.goDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            mainchar.goDir('LEFT');
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
            } else if (event.code == "Escape") {
                if(gameevents){
                    gameevents.handle_escape();
                }
                set_text_input_focus(false);
            }
            return;
        }

        if(!gameevents.mainchar){
            return;
        }

        let mainchar = gameevents.mainchar;

        if (event.code == "KeyW" || event.code == 'ArrowUp') {
            mainchar.stopDir('UP');
        }
        else if (event.code == 'KeyS' || event.code == 'ArrowDown') {
            // DOWN
            mainchar.stopDir('DOWN');
        }
        else if (event.code == 'KeyD' || event.code == 'ArrowRight') {
            // Right 
            mainchar.stopDir('RIGHT');
        }
        else if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
            // Left 
            mainchar.stopDir('LEFT');
        }
    }
);
