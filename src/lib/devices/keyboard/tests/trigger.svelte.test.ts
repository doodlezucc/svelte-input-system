import { expect, test } from 'vitest';
import type { KeyboardModifiers } from '../keyboard-modifiers.ts';
import { KeyboardState } from '../keyboard-state.svelte.ts';
import { KeyboardTriggerState } from '../keyboard-trigger.svelte.ts';

test('Release keys on focus loss', () => {
	const keyboardState = new KeyboardState();

	const trigger = new KeyboardTriggerState(keyboardState, {
		logicalKey: 'T'
	});

	expect(trigger.isPressed).toEqual(false);
	expect(trigger.repeats).toEqual(-1);

	keyboardState.processKeyDown(
		new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft', shiftKey: true })
	);
	keyboardState.processKeyDown(
		new KeyboardEvent('keydown', { key: 'T', code: 'KeyT', shiftKey: true })
	);
	keyboardState.processKeyDown(
		new KeyboardEvent('keydown', { key: 'T', code: 'KeyT', shiftKey: true, repeat: true })
	);

	expect(trigger.isPressed).toEqual(true);
	expect(trigger.repeats).toEqual(1);

	keyboardState.processFocusLoss();
	expect(keyboardState.modifiers).toEqual<KeyboardModifiers>({
		ctrl: false,
		shift: false,
		meta: false,
		alt: false
	});
	expect(keyboardState.pressedLogicalKeys.size).toEqual(0);
	expect(keyboardState.pressedPhysicalKeys.size).toEqual(0);
	expect(keyboardState.pressedLogicalKeysNormalized.size).toEqual(0);

	expect(trigger.isPressed).toEqual(false);
	expect(trigger.repeats).toEqual(-1);
});

test('Process normalized logical key with repeats', () => {
	const keyboardState = new KeyboardState();

	const trigger = new KeyboardTriggerState(keyboardState, {
		logicalKey: 'T'
	});

	expect(trigger.isPressed).toEqual(false);
	expect(trigger.repeats).toEqual(-1);

	keyboardState.processKeyDown(new KeyboardEvent('keydown', { key: 't' }));
	expect(trigger.isPressed).toEqual(true);
	expect(trigger.repeats).toEqual(0);

	keyboardState.processFocusLoss();
	expect(trigger.isPressed).toEqual(false);
	expect(trigger.repeats).toEqual(-1);

	keyboardState.processKeyDown(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
	expect(trigger.isPressed).toEqual(false);
	expect(trigger.repeats).toEqual(-1);

	keyboardState.processKeyDown(new KeyboardEvent('keydown', { key: 'T', shiftKey: true }));
	expect(trigger.isPressed).toEqual(true);
	expect(trigger.repeats).toEqual(0);

	keyboardState.processKeyDown(new KeyboardEvent('keydown', { key: 'T', shiftKey: true }));
	keyboardState.processKeyDown(new KeyboardEvent('keydown', { key: 'T', shiftKey: true }));
	expect(trigger.isPressed).toEqual(true);
	expect(trigger.repeats).toEqual(2);

	keyboardState.processKeyUp(new KeyboardEvent('keyup', { key: 'T', shiftKey: true }));
	expect(trigger.isPressed).toEqual(false);
	expect(trigger.repeats).toEqual(-1);
});
