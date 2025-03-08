import * as UIConfig from './uiconfig.js';
import * as KeyEvents from './keyevents.js';

export class TextInput {
    constructor(gevents, msg = 'enter text', callme = null, options = null) {
        this.gevents = gevents;
        this.callme = callme;
        this.msg = msg;
        this.focus = false;
        this.location = options?.location || 'bottom';
        
        // Create HTML input element
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = msg;
        this.input.value = '';
        this.input.className = 'game-input'; // Add a class for easier selection
        
        // Style the input to match the previous design
        this.input.style.position = 'fixed';
        this.input.style.width = `${UIConfig.TEXTINPUT_WIDTH}px`;
        this.input.style.height = `${UIConfig.TEXTINPUT_HEIGHT}px`;
        this.input.style.backgroundColor = '#F1D583';
        this.input.style.border = '2px solid #DCB000';
        this.input.style.borderRadius = '11px';
        this.input.style.padding = '11px';
        this.input.style.fontFamily = '"Trebuchet MS", Helvetica, sans-serif';
        this.input.style.fontSize = '16px !important';
        this.input.style.lineHeight = '16px';
        this.input.style.fontWeight = 'bold';
        this.input.style.color = '#000';
        this.input.style.outline = 'none';
        this.input.style.zIndex = '1000'; // Ensure input is above game canvas
        
        // Position at the bottom of the screen
        this.input.style.left = '50%';
        this.input.style.bottom = '20px';
        this.input.style.transform = 'translateX(-50%)'; // Center horizontally

        // Event handlers
        this.input.addEventListener('focus', () => {
            // console.log("TextInput focus");
            this.gevents.pauseevents = true;
            KeyEvents.set_text_input_focus(true);
            this.focus = true;
            this.input.value = '';
        });

        this.input.addEventListener('blur', () => {
            // console.log("TextInput blur");
            KeyEvents.set_text_input_focus(false);
            this.focus = false;
        });

        this.input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                const val = this.input.value;
                console.log("Text input: " + val);
                if (val === "") {
                    console.log("Text input empty. Bailing");
                    this.gevents.pauseevents = false;
                    KeyEvents.set_text_input_focus(false);
                    this.focus = false;
                    return;
                }
                if (this.callme) {
                    this.callme(val);
                }
                this.input.value = '';
                this.input.placeholder = this.msg;
                this.gevents.pauseevents = false;
                KeyEvents.set_text_input_focus(false);
                this.focus = false;
            }
        });
    }

    // Show the input element
    show() {
        if (this.input) {
            this.input.style.display = '';
        }
    }

    // Hide the input element
    hide() {
        if (this.input) {
            this.input.style.display = 'none';
        }
    }

    arrive() {
        // console.log("Adding text input");
        document.body.appendChild(this.input);
        this.input.focus();
        KeyEvents.set_input_visible(true);
        KeyEvents.set_text_input_focus(true);
        this.focus = true;
        
        // Check if we're currently in the log tab and hide if so
        const gameTab = document.getElementById('gameTab');
        if (gameTab && gameTab.style.display === 'none') {
            this.hide();
        }
    }

    leave() {
        console.log("Leaving text input");
        document.body.removeChild(this.input);
        KeyEvents.set_text_input_focus(false);
        this.focus = false;
        KeyEvents.set_input_visible(false);
    }
}