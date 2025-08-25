import { CompositeInputTrigger, type CompositeInputTriggerContext } from './composite.svelte.js';
import { ActionHandle, type InputHandles } from './input-handle.svelte.js';
import { type InputSet, type TriggerDefinition } from './input-set.svelte.js';
import type { InputTrigger } from './interfaces.js';
import { InterruptableKeyboardState } from './keyboard/interruptable-keyboard-state.svelte.js';
import { registerKeyboardStateDriver } from './keyboard/keyboard-driver.svelte.js';
import { KeyboardTrigger } from './keyboard/keyboard-trigger.svelte.js';

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

	createInputHandles<TAction extends string>(inputSet: InputSet<TAction>) {
		const result: Partial<Record<TAction, ActionHandle>> = {};

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

		return result as InputHandles<TAction>;
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
