/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { source, set, state, increment } from '../internal/client/reactivity/sources.js';
import { label, tag } from '../internal/client/dev/tracing.js';
import { active_effect, active_reaction, get, untrack, update_version } from '../internal/client/runtime.js';
import { async_mode_flag } from '../internal/flags/index.js';

var read_methods = ['forEach', 'isDisjointFrom', 'isSubsetOf', 'isSupersetOf'];
var set_like_methods = ['difference', 'intersection', 'symmetricDifference', 'union'];

var inited = false;

/**
 * A reactive version of the built-in [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) object.
 * Reading contents of the set (by iterating, or by reading `set.size` or calling `set.has(...)` as in the [example](https://svelte.dev/playground/53438b51194b4882bcc18cddf9f96f15) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the set is updated.
 *
 * Note that values in a reactive set are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
 *
 * ```svelte
 * <script>
 * 	import { SvelteSet } from 'svelte/reactivity';
 * 	let monkeys = new SvelteSet();
 *
 * 	function toggle(monkey) {
 * 		if (monkeys.has(monkey)) {
 * 			monkeys.delete(monkey);
 * 		} else {
 * 			monkeys.add(monkey);
 * 		}
 * 	}
 * </script>
 *
 * {#each ['🙈', '🙉', '🙊'] as monkey}
 * 	<button onclick={() => toggle(monkey)}>{monkey}</button>
 * {/each}
 *
 * <button onclick={() => monkeys.clear()}>clear</button>
 *
 * {#if monkeys.has('🙈')}<p>see no evil</p>{/if}
 * {#if monkeys.has('🙉')}<p>hear no evil</p>{/if}
 * {#if monkeys.has('🙊')}<p>speak no evil</p>{/if}
 * ```
 *
 * @template T
 * @extends {Set<T>}
 */
export class SvelteSet extends Set {
	/** @type {Map<T, Source<boolean>>} */
	#sources = new Map();
	/** @type {Source<Set<T>>} */
	#items = state(new Set());
	#update_version = update_version || -1;

	/**
	 * @param {Iterable<T> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		this.#items = state(new Set(value));

		var sources = this.#sources;

		for (const value of this.#items.v) {
			sources.set(value, this.#source(true));
		}

		if (DEV) {
			tag(this.#items, 'SvelteSet items');
		}

		if (!inited) this.#init();
	}

	/**
	 * If the source is being created inside the same reaction as the SvelteSet instance,
	 * we use `state` so that it will not be a dependency of the reaction. Otherwise we
	 * use `source` so it will be.
	 *
	 * @template T
	 * @param {T} value
	 * @returns {Source<T>}
	 */
	#source(value) {
		return update_version === this.#update_version ? state(value) : source(value);
	}

	// We init as part of the first instance so that we can treeshake this class
	#init() {
		inited = true;

		var proto = SvelteSet.prototype;
		var set_proto = Set.prototype;

		for (const method of read_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				// @ts-ignore
				return set_proto[method].apply(get(this.#items), v);
			};
		}

		for (const method of set_like_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				// @ts-ignore
				var set = /** @type {Set<T>} */ (set_proto[method].apply(get(this.#items), v));
				return new SvelteSet(set);
			};
		}
	}

	/** @param {T} value */
	has(value) {
		var sources = this.#sources;
		var s = sources.get(value);

		if (s === undefined) {
			if (!async_mode_flag) {
				// If the value doesn't exist, track the version in case it's added later
				// but don't create sources willy-nilly to track all possible values
				get(this.#items);
				return false;
			}

			s = this.#source((get(this.#items)).has(value));

			if (DEV) {
				tag(s, `SvelteSet has(${label(value)})`);
			}

			sources.set(value, s);
		}

		return get(s);
	}

	/** @param {T} value */
	add(value) {
		if (!get(this.#items).has(value)) {
			const clone = new Set(get(this.#items));
			clone.add(value);

			set(this.#items, clone);
		}

		var sources = this.#sources;
		var s = sources.get(value);

		if (s !== undefined) {
			set(s, true);
		} else {
			sources.set(value, this.#source(true));
		}

		return this;
	}

	/** @param {T} value */
	delete(value) {
		var has = get(this.#items).has(value);
		var sources = this.#sources;
		var s = sources.get(value);

		if (s !== undefined) {
			sources.delete(value);
			set(s, false);
		}

		if (has) {
			const clone = new Set(get(this.#items));
			clone.delete(value);

			set(this.#items, clone);
		}

		return has;
	}

	clear() {
		if (get(this.#items).size === 0) {
			return;
		}

		// Clear first, so we get nice console.log outputs with $inspect
		set(this.#items, new Set());

		var sources = this.#sources;

		for (var s of sources.values()) {
			set(s, false);
		}

		sources.clear();
	}

	keys() {
		return this.values();
	}

	values() {
		return get(this.#items).values();
	}

	entries() {
		return get(this.#items).entries();
	}

	[Symbol.iterator]() {
		return this.values();
	}

	get size() {
		return get(this.#items).size;
	}
}
