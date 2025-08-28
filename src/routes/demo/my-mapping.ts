import { InputSet } from 'svelte-input-system';

export const InGameInputSet = InputSet.stateful({
	actions: {
		jump: [{ logicalKey: ' ' }, { logicalKey: 'ArrowUp' }],
		pause: [{ logicalKey: 'Escape' }]
	}
});
