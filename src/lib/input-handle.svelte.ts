import { untrack } from 'svelte';
import type { InputTrigger } from './interfaces.js';

export type InputHandles<TAction extends string> = {
	readonly [K in TAction]: ActionHandle;
};

export class ActionHandle {
	private readonly trigger: InputTrigger;

	constructor(trigger: InputTrigger) {
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
