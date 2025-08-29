<script lang="ts">
	import { ExampleInputSet } from './example-input-set.js';

	let isCharacterOnScreen = $state(false);

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

	inputs.actions.sayHi.handleDown(() => {
		console.log('Hi!');
	});
</script>
