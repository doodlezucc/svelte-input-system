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

	readonly repeats = $derived.by(() => {
		if (!this.isPressed) {
			return -1;
		}

		return this.context.children.reduce<number>(
			(total, trigger) => (trigger.repeats >= 0 ? total + trigger.repeats : total),
			0
		);
	});
}
