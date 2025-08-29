# Svelte Input System

A simple input system for interactive web apps, built on Svelte 5 runes.

## Usage

Create an `InputSet` to define keybindings for any action you want to handle.

```ts
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
```

Then, access the states of your registered actions in a Svelte component (or anywhere in your code, really).

```svelte
<script lang="ts">
	import { ExampleInputSet } from './example-input-set.js';

	const actions = ExampleInputSet.state.actions;

	actions.sayHi.handleDown(() => {
		console.log('Hi!');
	});

	const isPressingUndoOrRedo = $derived(actions.undo.isPressed || actions.redo.isPressed);
</script>

<p>Is pressing "undo": {actions.undo.isPressed}</p>
<p>Is pressing "redo": {actions.redo.isPressed}</p>

<p>Is pressing either: {isPressingUndoOrRedo}</p>
```

By using the `handleDown(...)` and `handleUp(...)` functions from one of your actions, your component can react to events while mounted and automatically dispose your callback once unmounted.

You can use the `isPressed` property of an action like any other `$state` or `$derived(...)` variable - if it changes, Svelte will know what to do.
