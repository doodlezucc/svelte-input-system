import { untrack } from 'svelte';
import { CompositeInputTrigger, type CompositeInputTriggerContext } from './composite.svelte.js';
import { InputManager, useInputManager } from './input-manager.js';
import type { InputTrigger } from './interfaces.js';
import { type KeyboardTriggerDefinition } from './keyboard/keyboard-trigger.svelte.js';

export type TriggerDefinition = KeyboardTriggerDefinition;

export type InputBindings<TAction extends string> = {
	actions: {
		[K in TAction]: TriggerDefinition[];
	};
};

export function createInputSet<TAction extends string>(
	defaultBindings: InputBindings<TAction>
): InputSet<TAction> {
	return new InputSet<TAction>(defaultBindings);
}

export class InputSet<TAction extends string> {
	private readonly availableActions: TAction[];
	readonly defaultBindings: InputBindings<TAction>;

	bindings = $state() as InputBindings<TAction>;

	constructor(defaultBindings: InputBindings<TAction>) {
		this.availableActions = Object.keys(defaultBindings.actions) as TAction[];
		this.defaultBindings = defaultBindings;

		// Svelte automatically makes a deep copy when assigning the default bindings.
		this.bindings = defaultBindings;
	}

	resetBindings() {
		this.bindings = this.defaultBindings;
	}

	use() {
		const inputManager = useInputManager();

		const result: Record<string, DerivedActionState> = {};

		for (const action of this.availableActions) {
			const compositeInputTriggerContext = new InputSetCompositeInputTriggerContext(
				inputManager,
				this,
				action
			);

			const compositeTrigger = new CompositeInputTrigger(compositeInputTriggerContext);
			result[action] = new DerivedActionState(compositeTrigger);
		}

		return result as DerivedActionStates<TAction>;
	}
}

class InputSetCompositeInputTriggerContext<TAction extends string>
	implements CompositeInputTriggerContext
{
	constructor(
		private readonly inputManager: InputManager,
		private readonly inputSet: InputSet<TAction>,
		private readonly action: TAction
	) {}

	readonly children = $derived.by((): InputTrigger[] =>
		this.actionBindings.map((triggerDefinition) =>
			this.inputManager.createKeyboardTrigger(triggerDefinition)
		)
	);

	private readonly actionBindings = $derived.by(() => this.inputSet.bindings.actions[this.action]);
}

export class DerivedActionState {
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

export type DerivedActionStates<TAction extends string> = {
	readonly [K in TAction]: DerivedActionState;
};
