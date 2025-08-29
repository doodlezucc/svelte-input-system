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

	const isPressingUndoOrRedo = $derived(actions.undo.isPressed || actions.redo.isPressed);

	actions.sayHi.handleDown(() => {
		console.log('Hi!');
	});
</script>

<p>Is pressing "undo": {actions.undo.isPressed}</p>
<p>Is pressing "redo": {actions.redo.isPressed}</p>

<p>Is pressing either: {isPressingUndoOrRedo}</p>
```

You can use the `isPressed` property of an action like any other `$state` or `$derived(...)` variable - if it changes, Svelte will know what to do.

By using the `handleDown(...)` and `handleUp(...)` functions from one of your actions, your component can react to events while mounted and automatically dispose your callback once unmounted.

> [!NOTE]
> When listening to the `handleDown(...)` or `handleUp(...)` hooks, **`preventDefault()` is automatically called** on the event that triggered it.

### Bypassing Input Events

You can "filter" the state of your inputs, so that `handleDown(...)`, `handleUp(...)` and `isPressed` all require a custom pre-condition. This is useful for **ignoring events** while an HTML `<input>` or `<textarea>` is focused.

```svelte
<script lang="ts">
	import { ExampleInputSet } from './example-input-set.js';

	let activeElement = $state<Element | null>();

	const inputs = ExampleInputSet.state.conditional(() => {
		if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
			// Bypass input events if an input element is currently focused
			return false;
		}

		return true;
	});

	inputs.actions.sayHi.handleDown(() => {
		console.log('Hi!');
	});
</script>

<svelte:document bind:activeElement />
```

#### Condition Parameters

For more fine-grained control over what inputs to enable/disable, use the predicate parameters `input` and `actions` for evaluating a condition separately for each of your inputs.

```ts
let canCurrentlySayHi = $derived(isCharacterOnScreen);

const inputs = ExampleInputSet.state.conditional(({ input, actions }) => {
	switch (input) {
		case actions.undo:
		case actions.redo:
			return true;

		case actions.sayHi:
			return canCurrentlySayHi;
	}
});
```
