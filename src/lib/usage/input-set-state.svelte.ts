import type { TriggerState } from '$lib/devices/base/trigger.js';
import { watchBoolean } from '$lib/util/watch-boolean-effect.svelte.js';
import type { ActionOf, Inputs } from './types.js';

export type ActionStates<T extends Inputs> = Record<ActionOf<T>, ActionHandle>;

type PredicateActions<T extends Inputs> = {
	[K in ActionOf<T>]: K;
};

type InputSetStateFilterPredicate<T extends Inputs> = (context: {
	readonly input: ActionOf<T>;
	readonly actions: PredicateActions<T>;
}) => boolean;

export interface InputSetState<T extends Inputs> {
	readonly actions: ActionStates<T>;

	conditional(predicate: InputSetStateFilterPredicate<T>): InputSetState<T>;
}

export class InputSetStateImpl<T extends Inputs> implements InputSetState<T> {
	constructor(readonly actions: ActionStates<T>) {}

	conditional(predicate: InputSetStateFilterPredicate<T>): InputSetState<T> {
		const matches = {} as PredicateActions<T>;

		for (const action in this.actions) {
			// The "Action" type is merely for better looking types in the IDE.
			// In reality, symbols get compared when evaluating the predicate.
			matches[action] = action;
		}

		const filteredActions = { ...this.actions };

		for (const action in filteredActions) {
			filteredActions[action] = new ConditionalActionHandle(filteredActions[action], () => {
				return predicate({
					input: matches[action],
					actions: matches
				});
			});
		}

		return new InputSetStateImpl(filteredActions);
	}
}

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

class ConditionalActionHandle extends ActionHandle {
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
