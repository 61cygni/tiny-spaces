import * as PIXI from 'pixi.js';
import * as GLOBALS from '@spaced/globals.js';

export class TextCanvas {
    constructor(width, height, options = {}) {
        this.container = new PIXI.Container();
        this.width = width;
        this.height = height;
        
        // Default options
        this.options = {
            backgroundColor: 0x000000,
            backgroundAlpha: 0.7,
            textColor: 0xFFFFFF,
            padding: 10,
            fontSize: 12,
            fontFamily: 'Arial',
            // fontFamily: 'Courier New, Courier, monospace', // Updated to use monospace fonts
            lineSpacing: 5,
            ...options
        };

        // Create background
        this.background = new PIXI.Graphics();
        this.background.rect(0, 0, this.width, this.height);
        this.background.fill({ 
            color: this.options.backgroundColor, 
            alpha: this.options.backgroundAlpha 
        });
        
        this.container.addChild(this.background);
        
        // Create mask to clip text to visible area
        const mask = new PIXI.Graphics();
        mask.rect(0, 0, this.width, this.height);
        mask.fill({ color: 0xFFFFFF });
        this.container.addChild(mask);
        this.container.mask = mask;
        
        // Text container to manage scrolling
        this.textContainer = new PIXI.Container();
        this.container.addChild(this.textContainer);
        
        // Set initial position for text
        this.currentY = this.options.padding;
    }

    addText(text, style = {}) {
        const textStyle = new PIXI.TextStyle({
            fontFamily: this.options.fontFamily,
            fontSize: this.options.fontSize,
            fill: this.options.textColor,
            wordWrap: true,
            wordWrapWidth: this.width - (this.options.padding * 2),
            ...style
        });

        const textSprite = new PIXI.Text({text, style: textStyle});
        textSprite.x = this.options.padding;
        textSprite.y = this.currentY;
        
        this.textContainer.addChild(textSprite);
        
        // Update current Y position for next text
        this.currentY += textSprite.height + this.options.lineSpacing;
        
        // Scroll if content exceeds height
        this.scrollToBottom();
        
        return textSprite;
    }

    addItems(text, style = {}) {
        const actionStyle = new PIXI.TextStyle({
            fontFamily: this.options.fontFamily,
            fontSize: 10,
            // green color for actions
            fill: 0x00FF00,
            wordWrap: true,
            wordWrapWidth: this.width - (this.options.padding * 2),
            ...style
        });
        this.addText("items: " + text, actionStyle);
    }
    addAction(text, style = {}) {
        const actionStyle = new PIXI.TextStyle({
            fontFamily: this.options.fontFamily,
            fontSize: 10,
            // green color for actions
            fill: 0x00FF00,
            wordWrap: true,
            wordWrapWidth: this.width - (this.options.padding * 2),
            ...style
        });
        this.addText("action: " + text, actionStyle);
    }

    addDialog(name, text, style = {}) {
        const nameStyle = new PIXI.TextStyle({
            fontFamily: this.options.fontFamily,
            fontSize: this.options.fontSize,
            fill: 0xFFFF00, // Yellow color for name
            wordWrap: true,
            wordWrapWidth: this.width - (this.options.padding * 2),
            ...style
        });

        // Create name text
        const nameSprite = new PIXI.Text({text: name + ": ", style: nameStyle});
        nameSprite.x = this.options.padding;
        nameSprite.y = this.currentY;

        const textStyle = new PIXI.TextStyle({
            fontFamily: this.options.fontFamily,
            fontSize: this.options.fontSize,
            fill: 0xFFFFFF, // White color for text
            wordWrap: true,
            wordWrapWidth: this.width - (nameSprite.width + this.options.padding * 2),
            ...style
        });
        
        // Create message text
        const textSprite = new PIXI.Text({text, style: textStyle});
        textSprite.x = this.options.padding + nameSprite.width;
        textSprite.y = this.currentY;
        
        this.textContainer.addChild(nameSprite);
        this.textContainer.addChild(textSprite);
        
        // Update current Y position for next text
        this.currentY += Math.max(nameSprite.height, textSprite.height) + this.options.lineSpacing;
        
        // Scroll if content exceeds height
        this.scrollToBottom();
        
        return { nameSprite, textSprite };
    }

    clear() {
        while(this.textContainer.children.length > 0) {
            this.textContainer.removeChildAt(0);
        }
        this.currentY = this.options.padding;
    }

    scrollToBottom() {
        if (this.textContainer.height > this.height) {
            this.textContainer.y = this.height - (this.textContainer.height + 24);
        }
    }

    setPosition(x, y) {
        this.container.x = x;
        this.container.y = y;
    }

    toggle(){
        this.container.visible = !this.container.visible;
    }

    setZIndex(zIndex) {
        this.container.zIndex = zIndex;
    }
} 