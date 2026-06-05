export interface TriggerState {
	readonly isPressed: boolean;

	/**
	 * While held down, this property counts up with every consecutive
	 * browser-issued "down" event, until releasing the trigger.
	 *
	 * While the trigger is _released_, `repeats === -1`.
	 *
	 * For every _initial_ down event, `repeats === 0`.
	 */
	readonly repeats: number;
}
