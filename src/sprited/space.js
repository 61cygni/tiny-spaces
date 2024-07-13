import { Assets } from 'pixi.js';
import * as PIXI from 'pixi.js'

const sheet = await Assets.load('sprited1.json');

console.log(sheet.animations);

// spritesheet is ready to use!
const anim1 = new PIXI.AnimatedSprite(sheet.animations.row0);
//const anim2 = new PIXI.AnimatedSprite(sheet.animations.row1);
//const anim3 = new PIXI.AnimatedSprite(sheet.animations.row2);

// set the animation speed
 anim1.animationSpeed = 0.1666;
 //anim2.animationSpeed = 0.1666;
 //anim3.animationSpeed = 0.1666;

// play the animation on a loop
anim1.play();
//anim2.play();
//anim3.play();

//anim2.x = 16;
//anim3.x = 32;

const app = new PIXI.Application();
app.init({ backgroundColor: 0x2980b9, width: 640, height: 480, canvas: document.getElementById('spacecanvas') });

// add it to the stage to render
app.stage.addChild(anim1);
//app.stage.addChild(anim2);
//app.stage.addChild(anim3);