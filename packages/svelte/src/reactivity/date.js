/** @import { Source, Derived, Effect } from '#client' */
import { DERIVED } from '../internal/client/constants.js';
import { derived } from '../internal/client/index.js';
import { source, set } from '../internal/client/reactivity/sources.js';
import { active_reaction, get, set_active_reaction } from '../internal/client/runtime.js';

var inited = false;

/**
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function with_parent_effect(fn) {
	var previous_reaction = active_reaction;
	var parent_reaction = active_reaction;

	while (parent_reaction !== null) {
		if ((parent_reaction.f & DERIVED) === 0) {
			break;
		}
		parent_reaction = /** @type {Derived | Effect} */ (parent_reaction).parent;
	}

	set_active_reaction(parent_reaction);
	try {
		return fn();
	} finally {
		set_active_reaction(previous_reaction);
	}
}

export class SvelteDate extends Date {
	#time = source(super.getTime());

	/** @type {Map<keyof Date, Source<unknown>>} */
	#deriveds = new Map();

	/** @param {any[]} params */
	constructor(...params) {
		// @ts-ignore
		super(...params);
		if (!inited) this.#init();
	}

	#init() {
		inited = true;

		var proto = SvelteDate.prototype;
		var date_proto = Date.prototype;

		var methods = /** @type {Array<keyof Date & string>} */ (
			Object.getOwnPropertyNames(date_proto)
		);

		for (const method of methods) {
			if (method.startsWith('get') || method.startsWith('to') || method === 'valueOf') {
				// @ts-ignore
				proto[method] = function (...args) {
					// don't memoize if there are arguments
					// @ts-ignore
					if (args.length > 0) {
						get(this.#time);
						// @ts-ignore
						return date_proto[method].apply(this, args);
					}

					var d = this.#deriveds.get(method);

					if (d === undefined) {
						// Ensure we create the derived inside the nearest parent effect if
						// we're inside a derived, otherwise the derived will be destroyed each
						// time it re-runs
						d = with_parent_effect(() =>
							derived(() => {
								get(this.#time);
								// @ts-ignore
								return date_proto[method].apply(this, args);
							})
						);

						this.#deriveds.set(method, d);
					}

					return get(d);
				};
			}

			if (method.startsWith('set')) {
				// @ts-ignore
				proto[method] = function (...args) {
					// @ts-ignore
					var result = date_proto[method].apply(this, args);
					set(this.#time, date_proto.getTime.call(this));
					return result;
				};
			}
		}
	}
}
