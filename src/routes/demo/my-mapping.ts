import { createInputSet } from '$lib/usage/input-set.svelte.js';

export const InGameInputSet = createInputSet({
	actions: {
		jump: [{ logicalKey: ' ' }, { logicalKey: 'ArrowUp' }],
		pause: [{ logicalKey: 'Escape' }]
	}
});
