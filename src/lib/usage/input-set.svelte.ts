import type { TriggerDefinition } from '$lib/devices/union.js';
import type { Prettify } from 'ts-essentials';
import type { InputHandles } from './input-handles.svelte.js';
import { useInputManager } from './input-manager.svelte.js';
import type { Action, ActionOf, Inputs } from './types.js';

export type InputBindings = {
	actions: {
		[action: string]: TriggerDefinition[];
	};
};

type BindingsFrom<T extends Inputs> = Prettify<{
	actions: {
		[K in ActionOf<T>]: TriggerDefinition[];
	};
}>;

type CreateInputsTypeFromBindings<T extends InputBindings> = Prettify<{
	actions: {
		[K in keyof T['actions']]: Action;
	};
}>;

export function createInputSet<TBindings extends InputBindings>(defaultBindings: TBindings) {
	return new InputSet<CreateInputsTypeFromBindings<TBindings>>(
		defaultBindings as unknown as BindingsFrom<CreateInputsTypeFromBindings<TBindings>>
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
