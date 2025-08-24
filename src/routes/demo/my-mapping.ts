import { createInputSet } from '$lib/input-set.svelte.js';

export const InGameInputSet = createInputSet({
	actions: {
		jump: [{ logicalKey: ' ' }, { logicalKey: 'ArrowUp' }],
		pause: [{ logicalKey: 'Escape' }]
	}
});
