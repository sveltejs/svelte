/** @import { Source } from '#client' */
import { derived } from '../internal/client/index.js';
import { source, set } from '../internal/client/reactivity/sources.js';
import { active_reaction, get, set_active_reaction } from '../internal/client/runtime.js';

var inited = false;

export class SvelteDate extends Date {
	#time = source(super.getTime());

	/** @type {Map<keyof Date, Source<unknown>>} */
	#deriveds = new Map();

	#reaction = active_reaction;

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
						// lazily create the derived, but as though it were being
						// created at the same time as the class instance
						const reaction = active_reaction;
						set_active_reaction(this.#reaction);

						d = derived(() => {
							get(this.#time);
							// @ts-ignore
							return date_proto[method].apply(this, args);
						});

						this.#deriveds.set(method, d);

						set_active_reaction(reaction);
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
