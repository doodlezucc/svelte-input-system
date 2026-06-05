import { expect, test } from 'vitest';
import type { KeyboardModifiers } from '../keyboard-modifiers.ts';
import { KeyboardState } from '../keyboard-state.svelte.ts';

test.each<[string, KeyboardEventInit, KeyboardModifiers]>([
	[
		'None',
		{ ctrlKey: false, shiftKey: false, metaKey: false, altKey: false },
		{ ctrl: false, shift: false, meta: false, alt: false }
	],
	[
		'Ctrl',
		{ ctrlKey: true, shiftKey: false, metaKey: false, altKey: false },
		{ ctrl: true, shift: false, meta: false, alt: false }
	],
	[
		'Shift',
		{ ctrlKey: false, shiftKey: true, metaKey: false, altKey: false },
		{ ctrl: false, shift: true, meta: false, alt: false }
	],
	[
		'Meta',
		{ ctrlKey: false, shiftKey: false, metaKey: true, altKey: false },
		{ ctrl: false, shift: false, meta: true, alt: false }
	],
	[
		'Alt',
		{ ctrlKey: false, shiftKey: false, metaKey: false, altKey: true },
		{ ctrl: false, shift: false, meta: false, alt: true }
	],
	[
		'All',
		{ ctrlKey: true, shiftKey: true, metaKey: true, altKey: true },
		{ ctrl: true, shift: true, meta: true, alt: true }
	]
])('Parse key event modifiers (%s)', (_, event, expectedModifiers) => {
	const keyboardState = new KeyboardState();

	keyboardState.processKeyDown(new KeyboardEvent('keydown', event));
	expect(keyboardState.modifiers).toEqual(expectedModifiers);
});
