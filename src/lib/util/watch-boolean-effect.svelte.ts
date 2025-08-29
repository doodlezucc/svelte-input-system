import { untrack } from 'svelte';

interface BooleanEffectHandlers {
	onTrue: () => void | (() => void);
}

export function watchBoolean(condition: () => boolean, { onTrue }: BooleanEffectHandlers) {
	// This is not a state, because the effect should not re-run once initialized.
	let initialized = false;

	$effect.pre(() => {
		const isRelevantUpdate = condition();

		if (initialized && isRelevantUpdate) {
			untrack(() => onTrue());
		}

		initialized = true;
	});
}
