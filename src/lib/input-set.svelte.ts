import type { InputHandles } from './input-handle.svelte.js';
import { useInputManager } from './input-manager.svelte.js';
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
	readonly availableActions: TAction[];
	readonly defaultBindings: InputBindings<TAction>;

	bindings = $state() as InputBindings<TAction>;

	private cachedInputHandles: InputHandles<TAction> | undefined;

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
		if (!this.cachedInputHandles) {
			const inputManager = useInputManager();
			this.cachedInputHandles = inputManager.createInputHandles(this);
		}

		return this.cachedInputHandles;
	}
}
