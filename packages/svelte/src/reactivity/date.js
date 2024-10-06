/** @import { Source } from '#client' */
import { DESTROYED } from '../internal/client/constants.js';
import { derived } from '../internal/client/index.js';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

var inited = false;

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
			if (method.startsWith('get') || method.startsWith('to')) {
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

					if (d === undefined || (d.f & DESTROYED) !== 0) {
						d = derived(() => {
							get(this.#time);
							// @ts-ignore
							return date_proto[method].apply(this, args);
						});

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
