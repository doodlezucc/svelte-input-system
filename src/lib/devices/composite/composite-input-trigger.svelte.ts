import type { InputTrigger } from '../base/input-trigger.js';

export interface CompositeInputTriggerContext {
	readonly children: InputTrigger[];
}

export class CompositeInputTrigger implements InputTrigger {
	private readonly context: CompositeInputTriggerContext;

	constructor(context: CompositeInputTriggerContext) {
		this.context = context;
	}

	readonly isPressed = $derived.by(() =>
		this.context.children.some((trigger) => trigger.isPressed)
	);
}
