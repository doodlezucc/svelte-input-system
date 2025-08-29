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
