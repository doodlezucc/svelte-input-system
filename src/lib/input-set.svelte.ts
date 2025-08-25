import type { Prettify } from 'ts-essentials';
import type { InputHandles } from './input-handle.svelte.js';
import { useInputManager } from './input-manager.svelte.js';
import type { Action, ActionOf, Inputs } from './inputs-type.js';
import { type KeyboardTriggerDefinition } from './keyboard/keyboard-trigger.svelte.js';

export type TriggerDefinition = KeyboardTriggerDefinition;

export type InputBindings = {
	actions: {
		[action: string]: TriggerDefinition[];
	};
};

type CreateLookupFromBindings<T extends InputBindings> = Prettify<{
	actions: {
		[K in keyof T['actions']]: Action;
	};
}>;

type BindingsFrom<T extends Inputs> = Prettify<{
	actions: {
		[K in keyof T['actions']]: TriggerDefinition[];
	};
}>;

export function createInputSet<TBindings extends InputBindings>(defaultBindings: TBindings) {
	return new InputSet<CreateLookupFromBindings<TBindings>>(
		defaultBindings as unknown as BindingsFrom<CreateLookupFromBindings<TBindings>>
	);
}

export class InputSet<T extends Inputs> {
	readonly availableActions: ActionOf<T>[];
	readonly defaultBindings: BindingsFrom<T>;

	bindings = $state() as BindingsFrom<T>;

	private cachedInputHandles: InputHandles<T> | undefined;

	constructor(defaultBindings: BindingsFrom<T>) {
		this.availableActions = Object.keys(defaultBindings.actions) as ActionOf<T>[];
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
