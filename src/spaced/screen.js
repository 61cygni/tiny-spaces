// Global screen configuration parameters

class Screen {
    constructor(width, height, canvasname){
        this.width = width;
        this.height = height;
        this.canvasname = canvasname;
    }
}

var screen = null;

export function initScreen(width, height, canvasname){
    screen = new Screen(width, height, canvasname);
}

export function instance(){
    if(!screen){
        console.log("Error: Screen not initialized");
        throw new Error("Screen not initialized");
    }
    return screen;
}