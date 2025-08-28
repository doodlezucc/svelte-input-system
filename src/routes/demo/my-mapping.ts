import { InputSet } from 'svelte-inputs';

export const InGameInputSet = InputSet.stateful({
	actions: {
		jump: [{ logicalKey: ' ' }, { logicalKey: 'ArrowUp' }],
		pause: [{ logicalKey: 'Escape' }]
	}
});
