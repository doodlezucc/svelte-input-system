<script lang="ts">
	import { InGameInputSet } from './my-mapping.js';

	const input = InGameInputSet.use();

	input.jump.handleDown(() => {
		console.log('jump!');
	});

	input.jump.handleUp(() => {
		console.log('-');
	});

	let isPaused = $state(false);

	input.pause.handleDown(() => (isPaused = !isPaused));

	$inspect(InGameInputSet.bindings);
</script>

<p>{input.jump.isPressed}</p>
<p>{input.pause.isPressed}</p>

<p>Is paused: {isPaused}</p>

<input
	bind:value={InGameInputSet.bindings.actions.pause[0].logicalKey}
	placeholder="Custom logical key to pause..."
/>

<button onclick={() => InGameInputSet.resetBindings()}>Reset bindings</button>
