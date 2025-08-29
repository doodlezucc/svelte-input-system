import type { TriggerState } from '$lib/devices/base/trigger.js';
import { watchBoolean } from '$lib/util/watch-boolean-effect.svelte.js';

export class ActionHandle {
	protected readonly trigger: TriggerState;

	constructor(trigger: TriggerState) {
		this.trigger = trigger;
	}

	readonly isPressed = $derived.by(() => this.trigger.isPressed);

	handleDown(callback: () => void) {
		watchBoolean(() => this.isPressed, {
			onTrue: () => callback()
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
		trigger: TriggerState,
		private readonly computeIsEnabled: () => boolean
	) {
		super(trigger);
	}

	private readonly isEnabled = $derived.by(() => this.computeIsEnabled());

	override readonly isPressed = $derived.by(() => this.isEnabled && this.trigger.isPressed);

	override handleDown(callback: () => void) {
		watchBoolean(() => this.trigger.isPressed, {
			onTrue: () => {
				if (this.isEnabled) {
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
