import type { TriggerDefinition } from '$lib/devices/union.js';
import type { Prettify } from 'ts-essentials';
import { useInputManager } from './input-manager.svelte.js';
import type { InputSetState } from './state/input-set-state.svelte.js';
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

type ReadonlyBindingsFrom<T extends Inputs> = Prettify<{
	readonly actions: {
		readonly [K in ActionOf<T>]: Readonly<TriggerDefinition>[];
	};
}>;

type CreateInputsTypeFromBindings<T extends InputBindings> = Prettify<{
	actions: {
		[K in keyof T['actions']]: Action;
	};
}>;

export abstract class InputSet<T extends Inputs> {
	abstract bindings: BindingsFrom<T>;

	private cachedInputSetState: InputSetState<T> | undefined;

	readonly availableActions: ActionOf<T>[] = $derived.by(
		() => Object.keys(this.bindings.actions) as ActionOf<T>[]
	);

	get state() {
		if (!this.cachedInputSetState) {
			const inputManager = useInputManager();
			this.cachedInputSetState = inputManager.createInputSetState(this);
		}

		return this.cachedInputSetState;
	}

	static stateful<TBindings extends InputBindings>(defaultBindings: TBindings) {
		return new StatefulInputSetImpl(defaultBindings) as unknown as StatefulInputSet<
			CreateInputsTypeFromBindings<TBindings>
		>;
	}

	static derived<TBindings extends InputBindings>(createBindings: () => TBindings) {
		return new DerivedInputSetImpl(createBindings) as unknown as DerivedInputSet<
			CreateInputsTypeFromBindings<TBindings>
		>;
	}
}

export interface StatefulInputSet<T extends Inputs> extends InputSet<T> {
	readonly defaultBindings: BindingsFrom<T>;
	resetBindings(): void;
}

class StatefulInputSetImpl<T extends Inputs> extends InputSet<T> implements StatefulInputSet<T> {
	readonly defaultBindings: BindingsFrom<T>;

	constructor(defaultBindings: BindingsFrom<T>) {
		super();
		this.defaultBindings = defaultBindings;

		// Svelte automatically makes a deep copy when assigning the default bindings.
		this.bindings = defaultBindings;
	}

	bindings = $state() as BindingsFrom<T>;

	resetBindings() {
		this.bindings = this.defaultBindings;
	}
}

export interface DerivedInputSet<T extends Inputs> extends InputSet<T> {
	readonly bindings: ReadonlyBindingsFrom<T>;
}

class DerivedInputSetImpl<T extends Inputs> extends InputSet<T> implements DerivedInputSet<T> {
	private readonly createBindings: () => ReadonlyBindingsFrom<T>;

	constructor(createBindings: () => ReadonlyBindingsFrom<T>) {
		super();
		this.createBindings = createBindings;
	}

	readonly bindings = $derived.by(() => this.createBindings());
}
