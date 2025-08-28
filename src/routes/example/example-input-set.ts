import { InputSet } from 'svelte-input-system';

export const ExampleInputSet = InputSet.stateful({
	actions: {
		undo: [
			{ logicalKey: 'Undo' }, // Some keyboards have a designated "Undo" button
			{ logicalKey: 'Z', modifiers: { ctrl: true, shift: false } }
		],

		redo: [
			{ logicalKey: 'Redo' }, // Some keyboards have a designated "Redo" button
			{ logicalKey: 'Z', modifiers: { ctrl: true, shift: true } },
			{ logicalKey: 'Y', modifiers: { ctrl: true } }
		],

		sayHi: [
			{ logicalKey: ' ' } // Space bar
		]
	}
});
