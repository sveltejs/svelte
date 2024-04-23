import { DEV } from 'esm-env';
import { source, set } from '../internal/client/reactivity/sources.js';
import { effect } from '../internal/client/reactivity/effects.js';
import { get } from '../internal/client/runtime.js';
import { map } from './utils.js';

var read_methods = ['forEach', 'isDisjointFrom', 'isSubsetOf', 'isSupersetOf'];
var set_like_methods = ['difference', 'intersection', 'symmetricDifference', 'union'];

var inited = false;

/**
 * @template T
 * @extends {Set<T>}
 */
export class ReactiveSet extends Set {
	/** @type {Map<T, import('#client').Source<boolean>>} */
	#tracked = new Map();
	#version = source(0);
	#size = source(0);

	/**
	 * @param {Iterable<T> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		// If the value is invalid then the native exception will fire here
		if (DEV) new Set(value);

		if (value) {
			for (var element of value) {
				super.add(element);
			}

			this.#size.v = super.size;
		}

		if (!inited) this.#init();
	}

	// We init as part of the first instance so that we can treeshake this class
	#init() {
		inited = true;

		var proto = ReactiveSet.prototype;
		var set_proto = Set.prototype;

		for (const method of read_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);
				// @ts-ignore
				return set_proto[method].apply(this, v);
			};
		}

		for (const method of set_like_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);

				// @ts-ignore
				var set = /** @type {Set<T>} */ (set_proto[method].apply(this, v));
				return new ReactiveSet(set);
			};
		}
	}

	#increment_version() {
		set(this.#version, this.#version.v + 1);
	}

	/** @param {T} value */
	has(value) {
		var s = this.#tracked.get(value);

		if (s === undefined) {
			s = source(super.has(value));
			this.#tracked.set(value, s);
		}

		effect(() => () => {
			queueMicrotask(() => {
				if (s && !s.reactions) {
					this.#tracked.delete(value);
				}
			});
		});

		return get(s);
	}

	/** @param {T} value */
	add(value) {
		if (!super.has(value)) {
			super.add(value);
			set(this.#size, super.size);
			this.#increment_version();

			var s = this.#tracked.get(value);
			if (s !== undefined) {
				set(s, true);
			}
		}

		return this;
	}

	/** @param {T} value */
	delete(value) {
		var removed = super.delete(value);
		if (removed) {
			set(this.#size, super.size);
			this.#increment_version();

			var s = this.#tracked.get(value);
			if (s !== undefined) {
				set(s, false);
			}
		}

		return removed;
	}

	clear() {
		if (super.size !== 0) {
			set(this.#size, 0);
			for (var s of this.#tracked.values()) {
				set(s, false);
			}
			this.#increment_version();
		}

		super.clear();
	}

	keys() {
		get(this.#version);
		return map(super.keys(), (key) => key, 'Set Iterator');
	}

	values() {
		return this.keys();
	}

	entries() {
		return map(this.keys(), (key) => /** @type {[T, T]} */ ([key, key]), 'Set Iterator');
	}

	[Symbol.iterator]() {
		return this.keys();
	}

	get size() {
		return get(this.#size);
	}
}
