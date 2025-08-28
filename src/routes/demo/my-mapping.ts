import { InputSet } from '$lib/usage/input-set.svelte.js';

export const InGameInputSet = InputSet.stateful({
	actions: {
		jump: [{ logicalKey: ' ' }, { logicalKey: 'ArrowUp' }],
		pause: [{ logicalKey: 'Escape' }]
	}
});
