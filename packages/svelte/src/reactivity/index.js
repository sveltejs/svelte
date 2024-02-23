import { source } from '../internal/client/reactivity/sources';
import { get, set } from '../internal/client/runtime';

const read = [
	'getDate',
	'getDay',
	'getFullYear',
	'getHours',
	'getMilliseconds',
	'getMinutes',
	'getMonth',
	'getSeconds',
	'getTime',
	'getTimezoneOffset',
	'getUTCDate',
	'getUTCDay',
	'getUTCFullYear',
	'getUTCHours',
	'getUTCMilliseconds',
	'getUTCMinutes',
	'getUTCMonth',
	'getUTCSeconds',
	'getYear',
	'toDateString',
	'toISOString',
	'toJSON',
	'toLocaleDateString',
	'toLocalString',
	'toLocalTimeString',
	'toString',
	'toTimeString',
	'toUTCString'
];

const write = [
	'setDate',
	'setFullYear',
	'setHours',
	'setMilliseconds',
	'setMinutes',
	'setMonth',
	'setSeconds',
	'setTime',
	'setUTCDate',
	'setUTCFullYear',
	'setUTCHours',
	'setUTCMilliseconds',
	'setUTCMinutes',
	'setUTCMonth',
	'setUTCSeconds',
	'setYear'
];

class ReactiveDate extends Date {
	#raw_time = source(super.getTime());
	static #inited = false;

	// We init as part of the first instance so that we can treeshake this class
	#init() {
		if (!ReactiveDate.#inited) {
			ReactiveDate.#inited = true;
			const proto = ReactiveDate.prototype;
			const date_proto = Date.prototype;
			for (const method of read) {
				// @ts-ignore
				proto[method] = function () {
					get(this.#raw_time);
					// @ts-ignore
					return date_proto[method].call(this);
				};
			}
			for (const method of write) {
				// @ts-ignore
				proto[method] = function (/** @type {any} */ ...args) {
					// @ts-ignore
					const v = date_proto[method].apply(this, args);
					const time = date_proto.getTime.call(this);
					if (time !== this.#raw_time.v) {
						set(this.#raw_time, time);
					}
					return v;
				};
			}
		}
	}

	/**
	 * @param {any[]} values
	 */
	constructor(...values) {
		// @ts-ignore
		super(...values);
		this.#init();
	}
}

export { ReactiveDate as Date };
