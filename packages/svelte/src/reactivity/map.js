/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { set, source, state, increment } from '../internal/client/reactivity/sources.js';
import { label, tag } from '../internal/client/dev/tracing.js';
import { get, update_version } from '../internal/client/runtime.js';
import { async_mode_flag } from '../internal/flags/index.js';

const MISSING = Symbol('missing');

/**
 * A reactive version of the built-in [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object.
 * Reading contents of the map (by iterating, or by reading `map.size` or calling `map.get(...)` or `map.has(...)` as in the [tic-tac-toe example](https://svelte.dev/playground/0b0ff4aa49c9443f9b47fe5203c78293) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the map is updated.
 *
 * Note that values in a reactive map are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
 *
 * ```svelte
 * <script>
 * 	import { SvelteMap } from 'svelte/reactivity';
 * 	import { result } from './game.js';
 *
 * 	let board = new SvelteMap();
 * 	let player = $state('x');
 * 	let winner = $derived(result(board));
 *
 * 	function reset() {
 * 		player = 'x';
 * 		board.clear();
 * 	}
 * </script>
 *
 * <div class="board">
 * 	{#each Array(9), i}
 * 		<button
 * 			disabled={board.has(i) || winner}
 * 			onclick={() => {
 * 				board.set(i, player);
 * 				player = player === 'x' ? 'o' : 'x';
 * 			}}
 * 		>{board.get(i)}</button>
 * 	{/each}
 * </div>
 *
 * {#if winner}
 * 	<p>{winner} wins!</p>
 * 	<button onclick={reset}>reset</button>
 * {:else}
 * 	<p>{player} is next</p>
 * {/if}
 * ```
 *
 * @template K
 * @template V
 * @extends {Map<K, V>}
 */
export class SvelteMap extends Map {
	/** @type {Map<K, Source<V>>} */
	#sources = new Map();
	/** @type {Source<Map<K, V>>} */
	#items;
	#update_version = update_version || -1;

	/**
	 * @param {Iterable<readonly [K, V]> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		this.#items = state(new Map(value));

		var sources = this.#sources;

		for (const [key, value] of this.#items.v) {
			sources.set(key, this.#source(value));
		}

		if (DEV) {
			tag(this.#items, 'SvelteMap items');
		}
	}

	/**
	 * If the source is being created inside the same reaction as the SvelteMap instance,
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

	/** @param {K} key */
	has(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			if (!async_mode_flag) {
				// If the value doesn't exist, track the version in case it's added later
				// but don't create sources willy-nilly to track all possible values
				get(this.#items);
				return false;
			}

			var items = get(this.#items);
			var value = /** @type {V} */ (items.has(key) ? items.get(key) : (MISSING));

			s = this.#source(value);

			if (DEV) {
				tag(s, `SvelteSet has(${label(value)})`);
			}

			sources.set(key, s);
		}

		var value = get(s);
		return value !== MISSING;
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
	 * @param {any} [this_arg]
	 */
	forEach(callbackfn, this_arg) {
		for (const [key, value] of this.entries()) {
			callbackfn(value, key, this);
		}
	}

	/** @param {K} key */
	get(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			// We should always track the version in case
			// the Set ever gets this value in the future.
			var items = get(this.#items);
			return items.get(key);
		}

		var value = get(s);

		return value === MISSING ? undefined : value;
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * */
	set(key, value) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s !== undefined) {
			set(s, value);
		} else {
			sources.set(key, this.#source(value));
		}

		var items = get(this.#items);

		if (!items.has(key)) {
			const clone = new Map(items);
			clone.set(key, value);

			set(this.#items, clone);
		}

		return this;
	}

	/** @param {K} key */
	delete(key) {
		var items = get(this.#items);
		var has = items.has(key);
		var sources = this.#sources;
		var s = sources.get(key);

		if (s !== undefined) {
			sources.delete(key);
			set(s, /** @type {V} */ (MISSING));
		}

		if (has) {
			const clone = new Map(items);
			clone.delete(key);

			set(this.#items, clone);
		}

		return has;
	}

	clear() {
		if (get(this.#items).size === 0) {
			return;
		}

		// Clear first, so we get nice console.log outputs with $inspect
		set(this.#items, new Map());

		var sources = this.#sources;

		for (var s of sources.values()) {
			set(s, /** @type {V} */ (MISSING));
		}

		sources.clear();
	}

	keys() {
		return get(this.#items).keys();
	}

	*values() {
		for (const key of get(this.#items).keys()) {
			const s = this.#sources.get(key);
			if (s === undefined) continue;

			const value = get(s);
			if (value !== MISSING) yield value;
		}
	}

	*entries() {
		for (const key of get(this.#items).keys()) {
			const s = this.#sources.get(key);
			if (s === undefined) continue;

			const value = get(s);
			if (value !== MISSING) yield [key, value];
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		return get(this.#items).size;
	}
}
