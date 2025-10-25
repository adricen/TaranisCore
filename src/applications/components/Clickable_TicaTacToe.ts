import { Clickable } from "@/core/components/old/Clickable";

class ClickableTickTacToe extends Clickable {
    constructor({ onClick = null}: Partial<ClickableTickTacToe> = {}) {
        super({ onClick }); 
        if (!onClick) {
            this.onClick = this.innerClick;
        }
    }
    // find the entity on some behavior here
    innerClick = (): void => {
        // Handle the click event for Tic Tac Toe
        console.log('eaf')
    }
}

export { ClickableTickTacToe };
