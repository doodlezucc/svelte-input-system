import type { TriggerState } from '../base/trigger.js';

export interface CompositeTriggerContext {
	readonly children: TriggerState[];
}

export class CompositeTriggerState implements TriggerState {
	private readonly context: CompositeTriggerContext;

	constructor(context: CompositeTriggerContext) {
		this.context = context;
	}

	readonly isPressed = $derived.by(() =>
		this.context.children.some((trigger) => trigger.isPressed)
	);
}
