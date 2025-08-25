import { KeyboardState } from './keyboard-state.svelte.js';

export class InterruptableKeyboardState extends KeyboardState {
	private isCurrentEventHandled = false;

	preventCurrentEventDefault() {
		this.isCurrentEventHandled = true;
	}

	processKeyDown(ev: KeyboardEvent): void {
		this.isCurrentEventHandled = false;

		super.processKeyDown(ev);

		queueMicrotask(() => {
			if (this.isCurrentEventHandled) {
				ev.preventDefault();
				this.isCurrentEventHandled = false;
			}
		});
	}

	processKeyUp(ev: KeyboardEvent): void {
		this.isCurrentEventHandled = false;

		super.processKeyUp(ev);

		queueMicrotask(() => {
			if (this.isCurrentEventHandled) {
				ev.preventDefault();
				this.isCurrentEventHandled = false;
			}
		});
	}
}
