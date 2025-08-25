import type { InputTrigger } from '$lib/devices/base/input-trigger.js';
import {
	CompositeInputTrigger,
	type CompositeInputTriggerContext
} from '$lib/devices/composite/composite-input-trigger.svelte.js';
import type { TriggerDefinition } from '$lib/devices/union.js';
import { InterruptableKeyboardState } from '../devices/keyboard/interruptable-keyboard-state.svelte.js';
import { registerKeyboardStateDriver } from '../devices/keyboard/keyboard-driver.svelte.js';
import { KeyboardTrigger } from '../devices/keyboard/keyboard-trigger.svelte.js';
import { ActionHandle, type InputHandles } from './input-handles.svelte.js';
import type { InputSet } from './input-set.svelte.js';
import type { ActionOf, Inputs } from './types.js';

let inputManagerInstance: InputManager | undefined;

export function useInputManager() {
	inputManagerInstance ??= new InputManager();

	return inputManagerInstance!;
}

export class InputManager {
	private readonly keyboardState = new InterruptableKeyboardState();

	constructor() {
		registerKeyboardStateDriver(this.keyboardState);
	}

	createInputHandles<T extends Inputs>(inputSet: InputSet<T>) {
		const result: Partial<Record<ActionOf<T>, ActionHandle>> = {};

		for (const action of inputSet.availableActions) {
			const compositeTriggerContext = new BindingCompositeInputTrigger({
				getBindings() {
					return inputSet.bindings.actions[action];
				},

				createTriggerFromDefinition: (definition) => {
					return new KeyboardTrigger(this.keyboardState, definition);
				}
			});

			const compositeTrigger = new CompositeInputTrigger(compositeTriggerContext);
			const actionHandle = new ActionHandle(compositeTrigger);

			$effect(() => {
				compositeTriggerContext.children.map((trigger) => trigger.isPressed);

				this.keyboardState.preventCurrentEventDefault();
			});

			result[action] = actionHandle;
		}

		return result as InputHandles<T>;
	}
}

class BindingCompositeInputTrigger implements CompositeInputTriggerContext {
	constructor(
		private readonly context: {
			getBindings(): TriggerDefinition[];
			createTriggerFromDefinition(definition: TriggerDefinition): InputTrigger;
		}
	) {}

	readonly children = $derived.by((): InputTrigger[] =>
		this.context
			.getBindings()
			.map((definition) => this.context.createTriggerFromDefinition(definition))
	);
}
