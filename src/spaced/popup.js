// --
// This was largely written by Cursor
// -- 
import * as PIXI from 'pixi.js';
import * as GLOBALS from '@spaced/globals.js';

export class PopupDialog {
    constructor(message, options = {}) {
        this.container = new PIXI.Container();
        this.width = options.width || 300;
        this.height = options.height || 150;
        this.callback = null;
        
        // Default options
        this.options = {
            backgroundColor: 0x000000,
            backgroundAlpha: 0.9,
            textColor: 0xFFFFFF,
            padding: 20,
            fontSize: 16,
            fontFamily: 'Arial',
            message: message,
            ...options
        };

        // Create popup background
        this.background = new PIXI.Graphics();
        this.background.rect(0, 0, this.width, this.height);
        this.background.fill({ 
            color: this.options.backgroundColor, 
            alpha: this.options.backgroundAlpha 
        });
        
        // Center the popup
        this.background.x = 0; 
        this.background.y = 0;
        // check options for x and y
        if(this.options.x){
            this.background.x = this.options.x;
        }
        if(this.options.y){
            this.background.y = this.options.y;
        }
        this.container.addChild(this.background);

        // Add message text
        const messageStyle = new PIXI.TextStyle({
            fontFamily: this.options.fontFamily,
            fontSize: this.options.fontSize,
            fill: this.options.textColor,
            wordWrap: true,
            wordWrapWidth: this.width - (this.options.padding * 2),
            align: 'center'
        });

        const messageText = new PIXI.Text({
            text: this.options.message,
            style: messageStyle
        });
        messageText.x = this.background.x + (this.width - messageText.width) / 2;
        messageText.y = this.background.y + this.options.padding;
        this.container.addChild(messageText);

        // Create buttons
        this.createButtons();

        this.container.zIndex = GLOBALS.ZINDEX.POPUP;

        // Handle keyboard
        this.boundHandleKeyPress = this.handleKeyPress.bind(this);
        window.addEventListener('keydown', this.boundHandleKeyPress);
    }

    createButtons() {
        const buttonStyle = {
            fontSize: 14,
            padding: 10,
            width: 80,
            height: 30,
            margin: 10
        };

        // Yes button
        const yesButton = this.createButton('Yes', buttonStyle);
        yesButton.x = this.background.x + this.width/2 - buttonStyle.width - buttonStyle.margin;
        yesButton.y = this.background.y + this.height - buttonStyle.height - buttonStyle.padding;
        yesButton.on('pointerdown', () => this.submit(true));
        this.container.addChild(yesButton);

        // No button
        const noButton = this.createButton('No', buttonStyle);
        noButton.x = this.background.x + this.width/2 + buttonStyle.margin;
        noButton.y = this.background.y + this.height - buttonStyle.height - buttonStyle.padding;
        noButton.on('pointerdown', () => this.submit(false));
        this.container.addChild(noButton);
    }

    createButton(text, style) {
        const button = new PIXI.Container();
        
        // Button background
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, style.width, style.height);
        bg.fill({ color: 0x444444 });
        button.addChild(bg);

        // Button text
        const textStyle = new PIXI.TextStyle({
            fontFamily: this.options.fontFamily,
            fontSize: style.fontSize,
            fill: 0xFFFFFF
        });
        const buttonText = new PIXI.Text({
            text: text,
            style: textStyle
        });
        buttonText.x = (style.width - buttonText.width) / 2;
        buttonText.y = (style.height - buttonText.height) / 2;
        button.addChild(buttonText);

        // Make interactive
        button.eventMode = 'static';
        button.cursor = 'pointer';
        
        // Hover effect
        button.on('pointerover', () => bg.fill({ color: 0x666666 }));
        button.on('pointerout', () => bg.fill({ color: 0x444444 }));

        return button;
    }

    handleKeyPress(e) {
        console.log("handleKeyPress", e.key);
        if (e.key === 'Enter') {
            this.submit(true);
        } else if (e.key === 'Escape') {
            this.submit(false);
        }
    }

    show(callback) {
        this.callback = callback;
        return this.container;
    }

    submit(value) {
        this.close();
        if (this.callback) {
            this.callback(value);
        }
    }

    close() {
        window.removeEventListener('keydown', this.boundHandleKeyPress);
        if (this.container.parent) {
            this.container.parent.removeChild(this.container);
        }
    }
} 