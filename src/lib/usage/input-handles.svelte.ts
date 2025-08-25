import type { TriggerState } from '$lib/devices/base/trigger.js';
import { untrack } from 'svelte';
import type { ActionOf, Inputs } from './types.js';

export type InputHandles<T extends Inputs> = {
	readonly [K in ActionOf<T>]: ActionHandle;
};

export class ActionHandle {
	private readonly trigger: TriggerState;

	constructor(trigger: TriggerState) {
		this.trigger = trigger;
	}

	readonly isPressed = $derived.by(() => this.trigger.isPressed);

	handleDown(callback: () => void) {
		let initialized = false;

		$effect.pre(() => {
			if (this.isPressed) {
				untrack(() => {
					if (initialized) callback();
				});
			}
			initialized = true;
		});
	}

	handleUp(callback: () => void) {
		let initialized = false;

		$effect.pre(() => {
			if (!this.isPressed) {
				untrack(() => {
					if (initialized) callback();
				});
			}
			initialized = true;
		});
	}
}
