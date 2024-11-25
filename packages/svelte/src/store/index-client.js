/** @import { Readable, Writable } from './public.js' */
import {
	effect_root,
	effect_tracking,
	render_effect
} from '../internal/client/reactivity/effects.js';
import { source } from '../internal/client/reactivity/sources.js';
import { get as get_source } from '../internal/client/runtime.js';
import { increment } from '../reactivity/utils.js';
import { get, writable } from './shared/index.js';
import { createStartStopNotifier } from '../reactivity/start-stop-notifier.js';

export { derived, get, readable, readonly, writable } from './shared/index.js';

/**
 * @template V
 * @overload
 * @param {() => V} get
 * @param {(v: V) => void} set
 * @returns {Writable<V>}
 */
/**
 * @template V
 * @overload
 * @param {() => V} get
 * @returns {Readable<V>}
 */
/**
 * Create a store from a function that returns state, and (to make a writable store), an
 * optional second function that sets state.
 *
 * ```ts
 * import { toStore } from 'svelte/store';
 *
 * let count = $state(0);
 *
 * const store = toStore(() => count, (v) => (count = v));
 * ```
 * @template V
 * @param {() => V} get
 * @param {(v: V) => void} [set]
 * @returns {Writable<V> | Readable<V>}
 */
export function toStore(get, set) {
	let init_value = get();
	const store = writable(init_value, (set) => {
		// If the value has changed before we call subscribe, then
		// we need to treat the value as already having run
		let ran = init_value !== get();

		// TODO do we need a different implementation on the server?
		const teardown = effect_root(() => {
			render_effect(() => {
				const value = get();
				if (ran) set(value);
			});
		});

		ran = true;

		return teardown;
	});

	if (set) {
		return {
			set,
			update: (fn) => set(fn(get())),
			subscribe: store.subscribe
		};
	}

	return {
		subscribe: store.subscribe
	};
}

/**
 * @template V
 * @overload
 * @param {Writable<V>} store
 * @returns {{ current: V }}
 */
/**
 * @template V
 * @overload
 * @param {Readable<V>} store
 * @returns {{ readonly current: V }}
 */
/**
 * Convert a store to an object with a reactive `current` property. If `store`
 * is a readable store, `current` will be a readonly property.
 *
 * ```ts
 * import { fromStore, get, writable } from 'svelte/store';
 *
 * const store = writable(0);
 *
 * const count = fromStore(store);
 *
 * count.current; // 0;
 * store.set(1);
 * count.current; // 1
 *
 * count.current += 1;
 * get(store); // 2
 * ```
 * @template V
 * @param {Writable<V> | Readable<V>} store
 */
export function fromStore(store) {
	let value = /** @type {V} */ (undefined);
	let version = source(0);

	const notify = createStartStopNotifier(() => {
		let ran = false;

		const unsubscribe = store.subscribe((v) => {
			value = v;
			if (ran) increment(version);
		});

		ran = true;

		return unsubscribe;
	});

	function current() {
		if (effect_tracking()) {
			get_source(version);
			notify();
			return value;
		}

		return get(store);
	}

	if ('set' in store) {
		return {
			get current() {
				return current();
			},
			set current(v) {
				store.set(v);
			}
		};
	}

	return {
		get current() {
			return current();
		}
	};
}
