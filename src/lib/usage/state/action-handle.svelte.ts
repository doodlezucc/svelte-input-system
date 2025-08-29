import type { TriggerState } from '$lib/devices/base/trigger.js';
import { watchBoolean } from '$lib/util/watch-boolean-effect.svelte.js';
import type { InputManager } from '../input-manager.svelte.js';

export class ActionHandle {
	protected readonly inputManager: InputManager;
	protected readonly trigger: TriggerState;

	constructor(inputManager: InputManager, trigger: TriggerState) {
		this.inputManager = inputManager;
		this.trigger = trigger;
	}

	readonly isPressed = $derived.by(() => this.trigger.isPressed);

	handleDown(callback: () => void) {
		watchBoolean(() => this.isPressed, {
			onTrue: () => {
				this.inputManager.preventCurrentEventDefault();
				callback();
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

	private readonly isEnabled = $derived.by(() => this.computeIsEnabled());

	override readonly isPressed = $derived.by(() => this.isEnabled && this.trigger.isPressed);

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
