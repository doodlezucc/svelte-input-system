<script lang="ts">
	import { ExampleInputSet } from './example-input-set.js';

	const inputs = ExampleInputSet.state;

	inputs.sayHi.handleDown(() => {
		console.log('Hi!');
	});

	const isPressingUndoOrRedo = $derived(inputs.undo.isPressed || inputs.redo.isPressed);
</script>

<p>Is pressing "undo": {inputs.undo.isPressed}</p>
<p>Is pressing "redo": {inputs.redo.isPressed}</p>

<p>Is pressing either: {isPressingUndoOrRedo}</p>
