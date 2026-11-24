/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { set, source, state, increment } from '../internal/client/reactivity/sources.js';
import { label, tag } from '../internal/client/dev/tracing.js';
import {
	active_reaction,
	get,
	increment_write_version,
	untrack,
	untracking,
	update_version
} from '../internal/client/runtime.js';
import { first_batch } from '../internal/client/reactivity/batch.js';
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
	/**
	 * Outside async mode, readers of missing keys depend on this
	 * rather than on a per-key source, so that we don't create
	 * (and retain) a source for every key that is ever looked up
	 */
	#missing = state(0);
	/**
	 * In async mode, we create per-key sources for missing keys that are read
	 * inside reactions. Once `#sources` reaches this size, we schedule a sweep
	 * to remove the ones that are no longer needed (see `#prune`)
	 */
	#prune_at = 16;
	#prune_scheduled = false;
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
			tag(this.#missing, 'SvelteMap missing');
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

	/**
	 * Read the value for `key`, or `MISSING` if it doesn't exist
	 * @param {K} key
	 * @returns {V | typeof MISSING}
	 */
	#read(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			if (!async_mode_flag) {
				// Every existing key has a source, so this key is missing. Track
				// `#missing` in case it's added later, but don't create sources
				// willy-nilly to track all possible keys
				get(this.#missing);
				return MISSING;
			}

			// In async mode, we need a per-key source so that this reader isn't
			// affected by changes to other keys (which could belong to other batches).
			// Subsequent changes to this key go through `s`, so no need to track `#items`
			var items = this.#peek();
			var value = items.has(key) ? /** @type {V} */ (items.get(key)) : MISSING;

			// Untracked reads don't need to be notified of changes, so don't
			// create (and retain) a source for them
			if (active_reaction === null || untracking) {
				return value;
			}

			s = this.#source(/** @type {V} */ (value));

			if (DEV) {
				tag(s, `SvelteMap get(${label(key)})`);
			}

			sources.set(key, s);

			if (sources.size >= this.#prune_at && !this.#prune_scheduled) {
				this.#prune_scheduled = true;
				// Sweep in a microtask rather than now — the dependencies of a reaction
				// are only linked once it has finished running, so sources that were
				// read by a reaction that is currently running would look unused
				queueMicrotask(() => this.#prune());
			}
		}

		return get(s);
	}

	/**
	 * Remove sources for missing keys that nothing depends on any more,
	 * so that looking up lots of different keys doesn't leak memory
	 */
	#prune() {
		this.#prune_scheduled = false;

		// Batches hold onto the sources they wrote (and their views of them),
		// so only prune when there are none. If there are, we'll try again
		// the next time a source is created for a missing key
		if (first_batch !== null) return;

		var sources = this.#sources;

		for (var [key, s] of sources) {
			if (s.reactions === null && s.v === MISSING) {
				sources.delete(key);

				// A disconnected derived may still have `s` as a dependency. If the key is later
				// added, it will be written to a new source, so bump the write version of this one
				// to ensure such deriveds re-evaluate (and pick up the new source) when next read
				s.wv = increment_write_version();
			}
		}

		this.#prune_at = Math.max(16, sources.size * 2);
	}

	/** @param {K} key */
	has(key) {
		return this.#read(key) !== MISSING;
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
	 * @param {any} [this_arg]
	 */
	forEach(callbackfn, this_arg) {
		for (const [key, value] of this.#read_all()) {
			callbackfn.call(this_arg, value, key, this);
		}
	}

	/** @param {K} key */
	get(key) {
		var value = this.#read(key);
		return value === MISSING ? undefined : value;
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * */
	getOrInsert(key, value) {
		if (!this.#peek().has(key)) {
			this.set(key, value);
		}
		return /** @type {V} */ (this.get(key));
	}

	/**
	 * @param {K} key
	 * @param {(key: K) => V} callbackFn
	 */
	getOrInsertComputed(key, callbackFn) {
		if (!this.#peek().has(key)) {
			this.set(key, callbackFn(key));
		}
		return /** @type {V} */ (this.get(key));
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * */
	set(key, value) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s !== undefined) {
			if (!async_mode_flag && !s.equals(value)) {
				// A reader of this key may have subscribed to `#missing` before the key
				// was added (e.g. if it added the key itself) and not re-run since.
				// If not every such reader is a reader of `s`, notify them
				var missing_reactions = this.#missing.reactions;
				var s_reactions = s.reactions;

				if (
					missing_reactions !== null &&
					(s_reactions === null || !missing_reactions.every((r) => s_reactions?.includes(r)))
				) {
					increment(this.#missing);
				}
			}

			set(s, value);
		} else {
			s = this.#source(async_mode_flag ? /** @type {V} */ (MISSING) : value);
			sources.set(key, s);
			if (async_mode_flag) set(s, value);
		}

		var items = this.#peek();

		if (!items.has(key)) {
			const clone = new Map(items);
			clone.set(key, value);

			set(this.#items, clone);

			if (!async_mode_flag) {
				increment(this.#missing);
			}
		}

		return this;
	}

	/** @param {K} key */
	delete(key) {
		var items = this.#peek();
		var has = items.has(key);
		var sources = this.#sources;
		var s = sources.get(key);

		if (s !== undefined) {
			if (!async_mode_flag) sources.delete(key);
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
		if (this.#peek().size === 0) {
			return;
		}

		// Clear first, so we get nice console.log outputs with $inspect
		set(this.#items, new Map());

		var sources = this.#sources;

		for (var s of sources.values()) {
			set(s, /** @type {V} */ (MISSING));
		}

		if (!async_mode_flag) sources.clear();
	}

	/**
	 * Read the items as the current batch sees them, without
	 * making them a dependency of the active reaction
	 */
	#peek() {
		return untrack(() => get(this.#items));
	}

	/**
	 * Read every key and value (making them all dependencies)
	 * and return a snapshot of the map as the current batch sees it
	 * @returns {Map<K, V>}
	 */
	#read_all() {
		var result = new Map();
		var sources = this.#sources;

		for (var key of get(this.#items).keys()) {
			var s = sources.get(key);
			if (s === undefined) continue;

			var value = get(s);
			if (value !== MISSING) result.set(key, value);
		}

		return result;
	}

	keys() {
		return get(this.#items).keys();
	}

	values() {
		return this.#read_all().values();
	}

	entries() {
		return this.#read_all().entries();
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		return get(this.#items).size;
	}
}
