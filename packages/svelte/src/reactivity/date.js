/**
 * @import { Source } from "#client"
 */
import { derived } from '../internal/client/index.js';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

/**
 * @typedef {Exclude<{[Key in keyof Date]: Date[Key] extends Function ? Key : never}[keyof Date], symbol>} DateMethodNames
 */

var inited = false;
export class ReactiveDate extends Date {
	/**
	 * @type {Source<number>}
	 */
	#raw_time = source(super.getTime());

	/**
	 * @type {Map<DateMethodNames, Source<unknown>>}
	 */
	#deriveds = new Map();

	/**
	 * @param {any[]} params
	 */
	constructor(...params) {
		// @ts-ignore
		super(...params);
		this.#init();
	}

	#init() {
		if (inited) {
			return;
		}

		inited = true;
		var reactive_date_proto = ReactiveDate.prototype;
		var date_proto = Date.prototype;

		/**
		 * @type {Array<DateMethodNames>}
		 */
		var versioned_read_props = [
			'getTimezoneOffset',
			'getTime',
			'toISOString',
			'toLocaleString',
			'toJSON',
			'toUTCString',
			'toString'
		];

		var fine_grained_read_props = /** @type {Array<DateMethodNames>} */ (
			Object.getOwnPropertyNames(Date.prototype).filter(
				(prop) =>
					(prop.startsWith('get') || prop.startsWith('to')) &&
					!versioned_read_props.includes(/** @type {DateMethodNames} */ (prop))
			)
		);

		var write_props = /** @type {Array<DateMethodNames>} */ (
			Object.getOwnPropertyNames(Date.prototype).filter((prop) => prop.startsWith('set'))
		);

		for (const method of fine_grained_read_props) {
			// @ts-ignore
			reactive_date_proto[method] = function (...args) {
				// methods like getMinutes and getUTCMinutes can use the same signal
				// we strip getUTCMinutes to getMinutes so that they always result into the same signal
				var stripped_method_name = strip_local_and_utc(fine_grained_read_props, method);
				var sig = this.#deriveds.get(stripped_method_name);
				if (!sig) {
					sig = derived(() => {
						get(this.#raw_time);
						// @ts-ignore
						return date_proto[stripped_method_name].apply(this, args);
					});
					this.#deriveds.set(stripped_method_name, sig);
				}
				var result = get(sig);
				// @ts-ignore
				return method === stripped_method_name ? result : date_proto[method].apply(this, args);
			};
		}

		for (const method of versioned_read_props) {
			// @ts-ignore
			reactive_date_proto[method] = function (...args) {
				get(this.#raw_time);
				// @ts-ignore
				return date_proto[method].apply(this, args);
			};
		}

		for (const method of write_props) {
			// @ts-ignore
			reactive_date_proto[method] = function (...args) {
				// @ts-ignore
				var result = date_proto[method].apply(this, args);
				var new_time = date_proto.getTime.call(this);
				if (this.#raw_time.v !== new_time) {
					set(this.#raw_time, new_time);
				}
				return result;
			};
		}
	}
}

/**
 * if there is a method with exactly the same name but without `UTC` or `Locale`,
 * it will return that one otherwise returns the original `method_name`.
 * for instance for `getUTCMonth` we will get `getMonth` and for `toLocaleDateString` we will get `toDateString`
 * @param {Array<DateMethodNames>} all_method_names
 * @param {DateMethodNames} method_name
 * @return {DateMethodNames}
 */
function strip_local_and_utc(all_method_names, method_name) {
	var modified_method_name = method_name;

	if (method_name.includes('UTC')) {
		modified_method_name = /**@type {DateMethodNames}*/ (modified_method_name.replace('UTC', ''));
	} else if (method_name.includes('Locale')) {
		modified_method_name = /**@type {DateMethodNames}*/ (
			modified_method_name.replace('Locale', '')
		);
	}

	return all_method_names.includes(modified_method_name) ? modified_method_name : method_name;
}
