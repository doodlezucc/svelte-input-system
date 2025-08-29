import type { TriggerState } from '$lib/devices/base/trigger.js';
import {
	CompositeTriggerState,
	type CompositeTriggerContext
} from '$lib/devices/composite/composite-trigger.svelte.js';
import type { TriggerDefinition } from '$lib/devices/union.js';
import { BROWSER } from 'esm-env';
import { InterruptableKeyboardState } from '../devices/keyboard/interruptable-keyboard-state.svelte.js';
import { registerKeyboardStateDriver } from '../devices/keyboard/keyboard-driver.svelte.js';
import { KeyboardTriggerState } from '../devices/keyboard/keyboard-trigger.svelte.js';
import type { InputSet } from './input-set.svelte.js';
import { ActionHandle } from './state/action-handle.svelte.js';
import { InputSetStateImpl, type ActionStates } from './state/input-set-state.svelte.js';
import type { ActionOf, Inputs } from './types.js';

let inputManagerInstance: InputManager | undefined;

export function useInputManager() {
	if (!BROWSER) {
		return new InputManager();
	}

	if (!inputManagerInstance) {
		// By wrapping the InputManager instance in $effect.root, any $derived
		// or $effect calls inside of the class and its members persist for
		// the entirety of visiting the website.
		//
		// Otherwise, whatever component calls useInputManager() first
		// inadvertently becomes the OWNER of all dependencies within,
		// possibly leading to broken reactivity chains down the line.
		$effect.root(() => {
			inputManagerInstance = new InputManager();
			inputManagerInstance.registerStateDrivers();
		});
	}

	return inputManagerInstance!;
}

export class InputManager {
	private readonly keyboardState = new InterruptableKeyboardState();

	registerStateDrivers() {
		registerKeyboardStateDriver(this.keyboardState);
	}

	preventCurrentEventDefault() {
		this.keyboardState.preventCurrentEventDefault();
	}

	createInputSetState<T extends Inputs>(inputSet: InputSet<T>) {
		const actionHandles: Partial<Record<ActionOf<T>, ActionHandle>> = {};

		for (const action of inputSet.availableActions) {
			const compositeTriggerContext = new BindingsCompositeTriggerContext({
				getBindings() {
					return inputSet.bindings.actions[action];
				},

				createTriggerFromDefinition: (definition) => {
					return new KeyboardTriggerState(this.keyboardState, definition);
				}
			});

			const compositeTrigger = new CompositeTriggerState(compositeTriggerContext);
			const actionHandle = new ActionHandle(this, compositeTrigger);

			actionHandles[action] = actionHandle;
		}

		return new InputSetStateImpl(this, actionHandles as ActionStates<T>);
	}
}

class BindingsCompositeTriggerContext implements CompositeTriggerContext {
	constructor(
		private readonly context: {
			getBindings(): TriggerDefinition[];
			createTriggerFromDefinition(definition: TriggerDefinition): TriggerState;
		}
	) {}

	readonly children = $derived.by((): TriggerState[] =>
		this.context
			.getBindings()
			.map((definition) => this.context.createTriggerFromDefinition(definition))
	);
}
