import { SvelteSet } from 'svelte/reactivity';
import type { KeyboardModifiers } from './keyboard-modifiers.js';
import { normalizeLogicalKey } from './normalize-logical-key.js';

export class KeyboardState {
	#modifiers = $state<KeyboardModifiers>({
		alt: false,
		ctrl: false,
		meta: false,
		shift: false
	});

	#pressedLogicalKeysNormalized = new SvelteSet<string>();
	#pressedLogicalKeys = new SvelteSet<string>();
	#pressedPhysicalKeys = new SvelteSet<string>();

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
		this.#pressedLogicalKeysNormalized as ReadonlySet<string>
	);
	readonly pressedLogicalKeys = $derived(this.#pressedLogicalKeys as ReadonlySet<string>);
	readonly pressedPhysicalKeys = $derived(this.#pressedPhysicalKeys as ReadonlySet<string>);

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
		if (ev.repeat) return;

		this.applyModifiersFromEvent(ev);

		this.#pressedLogicalKeys.add(ev.key);
		this.#pressedPhysicalKeys.add(ev.code);

		this.#pressedLogicalKeysNormalized.add(normalizeLogicalKey(ev.key));

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
}
