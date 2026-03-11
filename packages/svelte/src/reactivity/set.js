/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { source, set, state, increment } from '../internal/client/reactivity/sources.js';
import { label, tag } from '../internal/client/dev/tracing.js';
import { active_reaction, get, update_version } from '../internal/client/runtime.js';
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
	#version = state(0);
	#update_version = update_version || -1;

	/**
	 * @param {Iterable<T> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		if (DEV) {
			// If the value is invalid then the native exception will fire here
			value = new Set(value);

			tag(this.#version, 'SvelteSet version');
		}

		if (value) {
			var sources = this.#sources;
			for (var element of value) {
				sources.set(element, this.#source(true));
			}
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
				get(this.#version);
				// Materialize current values into a temporary Set since values are stored in #sources
				var set = new Set(this.values());
				// @ts-ignore
				return set_proto[method].apply(set, v);
			};
		}

		for (const method of set_like_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);
				// Materialize current values into a temporary Set since values are stored in #sources
				var materialized = new Set(this.values());
				// @ts-ignore
				var set = /** @type {Set<T>} */ (set_proto[method].apply(materialized, v));
				return new SvelteSet(set);
			};
		}
	}

	/** @param {T} value */
	has(value) {
		var sources = this.#sources;
		var s = sources.get(value);

		if (s === undefined) {
			if (active_reaction === null && (!async_mode_flag)) {
				// If the value doesn't exist, track the version in case it's added later
				// but don't create sources willy-nilly to track all possible values
				get(this.#version);
				return false;
			}

			s = this.#source(false);

			if (DEV) {
				tag(s, `SvelteSet has(${label(value)})`);
			}

			sources.set(value, s);
		}

		return get(s);
	}

	/** @param {T} value */
	add(value) {
		var sources = this.#sources;
		var s = sources.get(value);

		if (s !== undefined) {
			if (!get(s)) {
				set(s, true);
				increment(this.#version);
			}
		} else {
			s = this.#source(true);
			sources.set(value, s);
			increment(this.#version);
		}

		return this;
	}

	/** @param {T} value */
	delete(value) {
		var sources = this.#sources;
		var s = sources.get(value);

		if (s !== undefined) {
			sources.delete(value);

			if (get(s)) {
				set(s, false);
				increment(this.#version);

				return true;
			}
		}

		return false;
	}

	clear() {
		var sources = this.#sources;
		var array = [];

		for (var s of sources.values()) {
			if (s.v) array.push(s);
		}

		if (array.length > 0) {
			// Clear first, so we get nice console.log outputs with $inspect
			sources.clear();
			increment(this.#version);

			for (const s of array) {
				set(s, false);
			}
		}
	}

	keys() {
		return this.values();
	}

	/**
	 * @returns {SetIterator<T>}
	 */
	*values() {
		get(this.#version);
		for (const [value, source] of this.#sources) {
			if (get(source)) yield value;
		}
	}

	/**
	 * @returns {SetIterator<[T, T]>}
	 */
	*entries() {
		for (const value of this.values()) {
			yield [value, value];
		}
	}

	[Symbol.iterator]() {
		return this.values();
	}

	get size() {
		var size = 0;
		for (const value of this.values()) {
			size += 1;
		}
		return size;
	}
}
