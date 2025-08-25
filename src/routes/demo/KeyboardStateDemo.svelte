<script lang="ts">
	import { KeyboardState } from '$lib/devices/keyboard/keyboard-state.svelte.js';
	import { KeyboardTriggerState } from '$lib/devices/keyboard/keyboard-trigger.svelte.js';

	const keyboardState = new KeyboardState();

	const myTrigger = new KeyboardTriggerState(keyboardState, {
		logicalKey: 'A',
		modifiers: {
			shift: true
		}
	});
</script>

<svelte:window
	onkeydown={(ev) => keyboardState.processKeyDown(ev)}
	onkeyup={(ev) => keyboardState.processKeyUp(ev)}
	onblur={() => keyboardState.processFocusLoss()}
/>

<p>{JSON.stringify(keyboardState.modifiers)}</p>
<p>{JSON.stringify([...keyboardState.pressedLogicalKeys])}</p>
<p>{JSON.stringify([...keyboardState.pressedPhysicalKeys])}</p>

<p>{myTrigger.isPressed}</p>
