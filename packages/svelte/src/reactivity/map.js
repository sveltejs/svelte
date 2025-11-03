/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { set, source, state, increment } from '../internal/client/reactivity/sources.js';
import { label, tag } from '../internal/client/dev/tracing.js';
import { get, update_version } from '../internal/client/runtime.js';

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
	/** @type {Map<K, Source<number>>} */
	#sources = new Map();
	#version = state(0);
	#size = state(0);
	#update_version = update_version || -1;
	#fully_trackable = true;

	/**
	 * @param {Iterable<readonly [K, V]> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		if (DEV) {
			// If the value is invalid then the native exception will fire here
			value = new Map(value);

			tag(this.#version, 'SvelteMap version');
			tag(this.#size, 'SvelteMap.size');
		}

		if (value) {
			for (var [key, v] of value) {
				super.set(key, v);
			}
			var size = super.size;
			this.#size.v = size;
			if (size > 0) {
				this.#fully_trackable = false;
			}
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
		var has = super.has(key);

		if (s === undefined) {
			s = this.#source(has ? 0 : -1);
			sources.set(key, s);

			if (DEV) {
				tag(s, `SvelteMap get(${label(key)})`);
			}
		}
		get(s);

		return has;
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
	 * @param {any} [this_arg]
	 */
	forEach(callbackfn, this_arg) {
		this.#read_all();
		super.forEach(callbackfn, this_arg);
	}

	/** @param {K} key */
	get(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			s = this.#source(super.has(key) ? 0 : -1);
			sources.set(key, s);

			if (DEV) {
				tag(s, `SvelteMap get(${label(key)})`);
			}
		}
		get(s);

		return super.get(key);
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * */
	set(key, value) {
		var sources = this.#sources;
		var s = sources.get(key);
		var prev_res = super.get(key);
		var res = super.set(key, value);
		var version = this.#version;

		if (s === undefined) {
			s = this.#source(0);

			if (DEV) {
				tag(s, `SvelteMap get(${label(key)})`);
			}

			sources.set(key, s);
			set(this.#size, super.size);
			increment(version);
			// if it is a signal for non-existing value
		} else if (s.v === -1) {
			set(this.#size, super.size);
			increment(s);
			increment(version);
		} else if (prev_res !== value) {
			increment(s);

			// if not every reaction of s is a reaction of version we need to also include version
			var v_reactions = version.reactions === null ? null : new Set(version.reactions);
			var needs_version_increase =
				v_reactions === null ||
				!s.reactions?.every((r) =>
					/** @type {NonNullable<typeof v_reactions>} */ (v_reactions).has(r)
				);
			if (needs_version_increase) {
				increment(version);
			}
		}

		return res;
	}

	/** @param {K} key */
	delete(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		var res = super.delete(key);

		if (s !== undefined && s.v !== -1) {
			set(this.#size, super.size);
			set(s, -1);
			increment(this.#version);
		}

		return res;
	}

	clear() {
		if (super.size === 0) {
			return;
		}
		// Clear first, so we get nice console.log outputs with $inspect
		super.clear();
		var sources = this.#sources;
		set(this.#size, 0);
		for (var s of sources.values()) {
			set(s, -1);
		}
		increment(this.#version);
	}

	#read_all() {
		get(this.#version);

		var sources = this.#sources;
		if (!this.#fully_trackable) {
			for (var key of super.keys()) {
				if (!sources.has(key)) {
					var s = this.#source(0);
					if (DEV) {
						tag(s, `SvelteMap get(${label(key)})`);
					}

					sources.set(key, s);
				}
			}
			this.#fully_trackable = true;
		}

		for ([, s] of sources) {
			if (s.v !== -1) get(s);
		}
	}

	keys() {
		get(this.#version);
		return super.keys();
	}

	values() {
		this.#read_all();
		return super.values();
	}

	entries() {
		this.#read_all();
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		get(this.#size);
		return super.size;
	}
}
