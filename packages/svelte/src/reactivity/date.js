import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

/**
 * @typedef {Exclude<{[Key in keyof Date]: Date[Key] extends Function ? Key : never}[keyof Date], symbol>} DateMethodNames
 */

var inited = false;
export class ReactiveDate extends Date {
	/**
	 * @type {Date}
	 */
	#modified_date_to_compare;

	/**
	 * @type {Map<DateMethodNames, import("#client").Source<boolean>>}
	 */
	#signals = new Map();

	#version = source(false);

	/**
	 * @param {any[]} params
	 */
	constructor(...params) {
		// @ts-ignore
		super(...params);
		// @ts-ignore
		this.#modified_date_to_compare = new Date(...params);
		this.#init();
	}

	#init() {
		if (inited) {
			return;
		}

		inited = true;
		var proto = ReactiveDate.prototype;
		var date_proto = Date.prototype;

		/**
		 * @type {Array<DateMethodNames>}
		 */
		var versioned_read_props = [
			'getTimezoneOffset',
			'getTime',
			'toDateString',
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
			proto[method] = function (...args) {
				// methods like getMinutes and getUTCMinutes can use the same signal
				var merged_method_name = strip_local_and_utc(fine_grained_read_props, method);
				var sig = this.#signals.get(merged_method_name);
				if (!sig) {
					sig = source(false);
					this.#signals.set(merged_method_name, sig);
				}
				get(sig);
				// @ts-ignore
				return date_proto[method].apply(this, args);
			};
		}

		for (const method of versioned_read_props) {
			// @ts-ignore
			proto[method] = function (...args) {
				get(this.#version);
				// @ts-ignore
				return date_proto[method].apply(this, args);
			};
		}

		for (const method of write_props) {
			// @ts-ignore
			proto[method] = function (...args) {
				// @ts-ignore
				var v = date_proto[method].apply(this, args);
				this.#notify_datetime_changes();
				// @ts-ignore
				this.#modified_date_to_compare[method](...args);
				return v;
			};
		}
	}

	/**
	 * we have to have another date instance to compare it with, because setting `X` might or might not affect `Y`
	 * for instance calling `date.setMonth(55)` will also change the `date.getYear()`
	 * but calling `date.setMonth(1)` (assuming its not 12) will not increase the year.
	 * we could check all of these edge-cases but I think that might become complicated very soon and introduce more bugs
	 * also there is the possibility of these behaviors to change as well,
	 * so using another date instance and applying the change is a better idea I guess
	 */
	#notify_datetime_changes() {
		if (this.#modified_date_to_compare.getTime() == super.getTime()) {
			return;
		}

		var is_date_changed = false;
		var is_time_changed = false;

		if (super.getFullYear() !== this.#modified_date_to_compare.getFullYear()) {
			this.#increment_signal('getFullYear');
			is_date_changed = true;
		}

		// @ts-expect-error
		if (super.getYear && super.getYear() !== this.#modified_date_to_compare.getYear()) {
			// @ts-expect-error
			this.#increment_signal('getYear');
			is_date_changed = true;
		}

		if (super.getMonth() !== this.#modified_date_to_compare.getMonth()) {
			this.#increment_signal('getMonth');
			is_date_changed = true;
		}

		if (super.getDate() !== this.#modified_date_to_compare.getDate()) {
			this.#increment_signal('getDate');
			is_date_changed = true;
		}

		if (super.getDay() !== this.#modified_date_to_compare.getDay()) {
			this.#increment_signal('getDay');
			is_date_changed = true;
		}

		if (super.getHours() !== this.#modified_date_to_compare.getHours()) {
			this.#increment_signal('getHours');
			is_time_changed = true;
		}

		if (super.getMinutes() !== this.#modified_date_to_compare.getMinutes()) {
			this.#increment_signal('getMinutes');
			is_time_changed = true;
		}

		if (super.getSeconds() !== this.#modified_date_to_compare.getSeconds()) {
			this.#increment_signal('getSeconds');
			is_time_changed = true;
		}

		if (super.getMilliseconds() !== this.#modified_date_to_compare.getMilliseconds()) {
			this.#increment_signal('getMilliseconds');
			is_time_changed = true;
		}

		if (is_time_changed) {
			this.#increment_signal('toTimeString');
		}

		if (is_date_changed) {
			this.#increment_signal('toDateString');
		}

		if (is_time_changed || is_date_changed) {
			set(this.#version, !this.#version.v);
		}
	}

	/**
	 * @param  {DateMethodNames} method_name
	 */
	#increment_signal(method_name) {
		var signal = this.#signals.get(method_name);
		if (!signal) {
			return;
		}
		// not using a number intentionally because its enough (it will increment the internal signal's version)
		set(signal, !signal.v);
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
