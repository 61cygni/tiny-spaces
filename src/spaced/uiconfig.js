// Magic numbers for basic UI placement

// DIALOG Class
export const DIALOG_WIDTH = 256 // Width in pixels of Dialog box 
export const DIALOG_HEIGHT = 96 // Height in pixels of Dialog box
export const DIALOG_PADDING = 16 // padding between edge of Dialog and text
export const DIALOG_TEXT_PAUSE = .25 // pause between characters in seconds
export const DIALOG_MAX_HEIGHT = DIALOG_HEIGHT - (DIALOG_PADDING) // max height of text in dialog
export const DIALOG_MAX_WIDTH = DIALOG_WIDTH - (2*DIALOG_PADDING) // max width of text in dialog
export const DIALOG_DEFAULT_FONTSIZE = 10; // default font size for text in dialog

export const TEXTINPUT_WIDTH = 256
export const TEXTINPUT_HEIGHT = 48
export const TEXTINPUT_PADDING = 2
export const TEXTINPUT_MAX_HEIGHT = TEXTINPUT_HEIGHT - (TEXTINPUT_PADDING)
export const TEXTINPUT_MAX_WIDTH  = TEXTINPUT_WIDTH  - (TEXTINPUT_PADDING)

// Relative position of dialog and textinput
export const DIALOG_TEXTINPUT_Y_OFFSET = 48 // hight dialog box is above input bar for character dialog
export const DIALOG_TEXTINPUT_X_OFFSET = 16 // offset of dialog and input bar are to the right of main character 
