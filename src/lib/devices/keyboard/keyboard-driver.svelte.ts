import type { KeyboardState } from './keyboard-state.svelte.js';

export function registerKeyboardStateDriver(keyboardState: KeyboardState) {
	$effect(() => {
		function onKeyDown(ev: KeyboardEvent) {
			keyboardState.processKeyDown(ev);
		}

		function onKeyUp(ev: KeyboardEvent) {
			keyboardState.processKeyUp(ev);
		}

		function onBlur() {
			keyboardState.processFocusLoss();
		}

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('blur', onBlur);
	});
}
