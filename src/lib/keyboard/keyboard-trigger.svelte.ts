import type { InputTrigger } from '$lib/interfaces.js';
import type { XOR } from 'ts-essentials';
import type { KeyboardModifiers } from './keyboard-modifiers.js';
import { KeyboardState } from './keyboard-state.svelte.js';
import { normalizeLogicalKey } from './normalize-logical-key.js';

interface LogicalKeyboardTriggerOptions {
	readonly logicalKey: string;

	/**
	 * If true, requires the `logicalKey` to be pressed exactly as specified.
	 *
	 * ```ts
	 * // Matches only if the A key is pressed while holding Shift.
	 * { logicalKey: 'A', matchCase: true }
	 *
	 * // Always matches if the A key is pressed (default).
	 * { logicalKey: 'A' }
	 * ```
	 */
	readonly matchCase?: boolean;
}

interface PhysicalKeyboardTriggerOptions {
	readonly physicalKey: string;
}

export type KeyboardTriggerDefinition = XOR<
	LogicalKeyboardTriggerOptions,
	PhysicalKeyboardTriggerOptions
> & {
	readonly modifiers?: Partial<KeyboardModifiers>;
};

export class KeyboardTrigger implements InputTrigger {
	private readonly keyboardState: KeyboardState;

	private readonly physicalKey: string | undefined;
	private readonly logicalKey: string | undefined;
	private readonly matchCase: boolean | undefined;
	private readonly modifiers: Partial<KeyboardModifiers> | undefined;

	constructor(keyboardState: KeyboardState, options: KeyboardTriggerDefinition) {
		this.keyboardState = keyboardState;

		this.physicalKey = options.physicalKey;
		this.logicalKey = options.logicalKey;
		this.matchCase = options.matchCase;
		this.modifiers = options.modifiers;
	}

	readonly isPressed = $derived.by((): boolean => {
		if (this.modifiers) {
			const pressed = this.keyboardState.modifiers;
			const { alt, ctrl, meta, shift } = this.modifiers;

			if (alt !== undefined && alt !== pressed.alt) return false;
			if (ctrl !== undefined && ctrl !== pressed.ctrl) return false;
			if (meta !== undefined && meta !== pressed.meta) return false;
			if (shift !== undefined && shift !== pressed.shift) return false;
		}

		if (this.physicalKey !== undefined) {
			return this.keyboardState.pressedPhysicalKeys.has(this.physicalKey);
		} else if (this.matchCase) {
			return this.keyboardState.pressedLogicalKeys.has(this.logicalKey!);
		} else {
			return this.keyboardState.pressedLogicalKeysNormalized.has(
				normalizeLogicalKey(this.logicalKey!)
			);
		}
	});
}
