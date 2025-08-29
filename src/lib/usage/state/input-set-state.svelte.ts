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
	constructor(readonly actions: ActionStates<T>) {}

	conditional(predicate: InputSetStateFilterPredicate<T>): InputSetState<T> {
		const matches = {} as ActionsLookup<T>;

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
