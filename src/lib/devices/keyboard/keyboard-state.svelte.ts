import { SvelteMap } from 'svelte/reactivity';
import type { KeyboardModifiers } from './keyboard-modifiers.js';
import { normalizeLogicalKey } from './normalize-logical-key.js';

export interface KeyState {
	repeats: number;
}

export class KeyboardState {
	#modifiers = $state<KeyboardModifiers>({
		alt: false,
		ctrl: false,
		meta: false,
		shift: false
	});

	#pressedLogicalKeysNormalized = new SvelteMap<string, KeyState>();
	#pressedLogicalKeys = new SvelteMap<string, KeyState>();
	#pressedPhysicalKeys = new SvelteMap<string, KeyState>();

	// When pressing down the physical 'a' key while holding Shift,
	// the reported logical key will be 'A' (assuming a QWERTY layout).
	// If the Shift key is then released BEFORE releasing 'a', a different
	// logical key gets reported as being released. To handle this, the logical
	// key associated with a physical key gets tracked when pressing down.
	//
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#pressedPhysicalToLogicalKeyMap = new Map<string, string>();

	readonly modifiers = $derived(this.#modifiers);

	readonly pressedLogicalKeysNormalized = $derived(
		this.#pressedLogicalKeysNormalized as ReadonlyMap<string, KeyState>
	);
	readonly pressedLogicalKeys = $derived(this.#pressedLogicalKeys as ReadonlyMap<string, KeyState>);
	readonly pressedPhysicalKeys = $derived(
		this.#pressedPhysicalKeys as ReadonlyMap<string, KeyState>
	);

	processFocusLoss() {
		this.#modifiers = {
			alt: false,
			ctrl: false,
			meta: false,
			shift: false
		};
		this.#pressedLogicalKeysNormalized.clear();
		this.#pressedLogicalKeys.clear();
		this.#pressedPhysicalKeys.clear();
	}

	processKeyDown(ev: KeyboardEvent) {
		this.applyModifiersFromEvent(ev);

		this.updateKeyStateOnDownEvent(this.#pressedLogicalKeys, ev.key);
		this.updateKeyStateOnDownEvent(this.#pressedPhysicalKeys, ev.key);

		this.updateKeyStateOnDownEvent(this.#pressedLogicalKeysNormalized, normalizeLogicalKey(ev.key));

		this.#pressedPhysicalToLogicalKeyMap.set(ev.code, ev.key);
	}

	processKeyUp(ev: KeyboardEvent) {
		this.applyModifiersFromEvent(ev);

		this.#pressedLogicalKeys.delete(ev.key);
		this.#pressedPhysicalKeys.delete(ev.code);

		this.#pressedLogicalKeysNormalized.delete(normalizeLogicalKey(ev.key));

		const logicalKeyFromDownEvent = this.#pressedPhysicalToLogicalKeyMap.get(ev.code);
		if (logicalKeyFromDownEvent !== undefined) {
			this.#pressedLogicalKeys.delete(logicalKeyFromDownEvent);
			this.#pressedLogicalKeysNormalized.delete(normalizeLogicalKey(logicalKeyFromDownEvent));
		}
	}

	private applyModifiersFromEvent(ev: KeyboardEvent) {
		this.#modifiers = {
			alt: ev.altKey,
			ctrl: ev.ctrlKey,
			meta: ev.metaKey,
			shift: ev.shiftKey
		};
	}

	private updateKeyStateOnDownEvent(map: SvelteMap<string, KeyState>, mapKey: string) {
		const currentState = map.get(mapKey);

		if (!currentState) {
			map.set(mapKey, { repeats: 0 });
		} else {
			map.set(mapKey, { ...currentState, repeats: currentState.repeats + 1 });
		}
	}
}
