import type { InputManager } from '../input-manager.svelte.js';
import type { ActionOf, Inputs } from '../types.js';
import { ConditionalActionHandle, type ActionHandle } from './action-handle.svelte.js';

export interface InputSetState<T extends Inputs> {
	readonly actions: ActionStates<T>;

	conditional(predicate: InputSetStateFilterPredicate<T>): InputSetState<T>;
}

export type ActionStates<T extends Inputs> = Record<ActionOf<T>, ActionHandle>;

type ActionsLookup<T extends Inputs> = {
	[K in ActionOf<T>]: K;
};

interface InputSetStateFilterContext<T extends Inputs> {
	readonly input: ActionOf<T>;
	readonly actions: ActionsLookup<T>;
}

export type InputSetStateFilterPredicate<T extends Inputs> = (
	context: InputSetStateFilterContext<T>
) => boolean;

export class InputSetStateImpl<T extends Inputs> implements InputSetState<T> {
	constructor(
		private readonly inputManager: InputManager,
		readonly actions: ActionStates<T>
	) {}

	conditional(predicate: InputSetStateFilterPredicate<T>): InputSetState<T> {
		const matches = {} as ActionsLookup<T>;

		for (const action in this.actions) {
			matches[action] = action;
		}

		const filteredActions = { ...this.actions };

		for (const action in filteredActions) {
			filteredActions[action] = new ConditionalActionHandle(
				this.inputManager,
				filteredActions[action],
				() => predicate({ input: matches[action], actions: matches })
			);
		}

		return new InputSetStateImpl(this.inputManager, filteredActions);
	}
}
