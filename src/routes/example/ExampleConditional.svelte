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
