import { registerKeyboardStateDriver } from './keyboard/keyboard-driver.svelte.js';
import { KeyboardState } from './keyboard/keyboard-state.svelte.js';
import {
	KeyboardTrigger,
	type KeyboardTriggerDefinition
} from './keyboard/keyboard-trigger.svelte.js';

export class InputManager {
	private readonly keyboardState = new KeyboardState();

	constructor() {
		registerKeyboardStateDriver(this.keyboardState);
	}

	createKeyboardTrigger(definition: KeyboardTriggerDefinition) {
		return new KeyboardTrigger(this.keyboardState, definition);
	}
}

let inputManagerInstance: InputManager | undefined;

export function useInputManager() {
	inputManagerInstance ??= new InputManager();

	return inputManagerInstance!;
}
