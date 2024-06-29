/** @import { Source } from '#client' */
import { derived } from '../internal/client/index.js';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

var inited = false;

export class ReactiveDate extends Date {
	#time = source(super.getTime());

	/** @type {Map<keyof Date, Source<unknown>>} */
	#deriveds = new Map();

	/** @param {any[]} params */
	constructor(...params) {
		// @ts-ignore
		super(...params);
		this.#init();
	}

	#init() {
		if (inited) return;
		inited = true;

		var reactive_date_proto = ReactiveDate.prototype;
		var date_proto = Date.prototype;

		var read_props = /** @type {Array<keyof Date>} */ (
			Object.getOwnPropertyNames(Date.prototype).filter(
				(prop) => prop.startsWith('get') || prop.startsWith('to')
			)
		);

		var write_props = /** @type {Array<keyof Date>} */ (
			Object.getOwnPropertyNames(Date.prototype).filter((prop) => prop.startsWith('set'))
		);

		for (const method of read_props) {
			// @ts-ignore
			reactive_date_proto[method] = function (...args) {
				var d = this.#deriveds.get(method);

				if (!d) {
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

		for (const method of write_props) {
			// @ts-ignore
			reactive_date_proto[method] = function (...args) {
				// @ts-ignore
				var result = date_proto[method].apply(this, args);
				set(this.#time, date_proto.getTime.call(this));
				return result;
			};
		}
	}
}
