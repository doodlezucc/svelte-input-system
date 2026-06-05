import type { TriggerState } from '$lib/devices/base/trigger.js';
import { watchBoolean } from '$lib/util/watch-boolean-effect.svelte.js';
import { BROWSER } from 'esm-env';
import { untrack } from 'svelte';
import type { InputManager } from '../input-manager.svelte.js';

interface RepeatsContext {
	repeats: number;
}

export class ActionHandle implements TriggerState {
	protected readonly inputManager: InputManager;
	protected readonly trigger: TriggerState;

	constructor(inputManager: InputManager, trigger: TriggerState) {
		this.inputManager = inputManager;
		this.trigger = trigger;
	}

	readonly isPressed = $derived.by(() => this.trigger.isPressed);
	readonly repeats = $derived.by(() => this.trigger.repeats);

	handleDown(callback: () => void) {
		watchBoolean(() => this.isPressed, {
			onTrue: () => {
				this.inputManager.preventCurrentEventDefault();
				callback();
			}
		});
	}

	handleDownWithRepeats(callback: (context: RepeatsContext) => void) {
		$effect.pre(() => {
			if (this.isPressed) {
				const repeats = this.trigger.repeats;

				untrack(() => {
					this.inputManager.preventCurrentEventDefault();
					callback({ repeats });
				});
			}
		});
	}

	handleUp(callback: () => void) {
		watchBoolean(() => !this.isPressed, {
			onTrue: () => callback()
		});
	}
}

export class ConditionalActionHandle extends ActionHandle {
	constructor(
		inputManager: InputManager,
		trigger: TriggerState,
		private readonly computeIsEnabled: () => boolean
	) {
		super(inputManager, trigger);
	}

	// The condition doesn't get computed during server-side rendering, because it's only
	// relevant to live user interaction and likely contains checks against the document's
	// "activeElement" (for example, to bypass input events while editing a text field).
	private readonly isEnabled = $derived.by(() => BROWSER && this.computeIsEnabled());

	override readonly isPressed = $derived.by(() => this.isEnabled && this.trigger.isPressed);
	override readonly repeats = $derived.by(() => (this.isEnabled ? this.trigger.repeats : -1));

	override handleDown(callback: () => void) {
		watchBoolean(() => this.trigger.isPressed, {
			onTrue: () => {
				if (this.isEnabled) {
					this.inputManager.preventCurrentEventDefault();
					callback();
				}
			}
		});
	}

	override handleDownWithRepeats(callback: (context: RepeatsContext) => void) {
		$effect.pre(() => {
			if (this.trigger.isPressed) {
				const repeats = this.trigger.repeats;

				untrack(() => {
					if (this.isEnabled) {
						this.inputManager.preventCurrentEventDefault();
						callback({ repeats });
					}
				});
			}
		});
	}

	override handleUp(callback: () => void) {
		watchBoolean(() => !this.trigger.isPressed, {
			onTrue: () => {
				if (this.isEnabled) {
					callback();
				}
			}
		});
	}
}
