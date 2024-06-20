import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';

var inited = false;
export class ReactiveDate extends Date {
	/**
	 * @type {Date}
	 */
	#modified_date_to_compare;

	/**
	 * @type {Map<keyof Date, import("#client").Source<boolean>>}
	 */
	#signals = new Map();

	/**
	 * @param {ConstructorParameters<typeof Date>} params
	 */
	constructor(...params) {
		super(...params);
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

		var read = /** @type {Array<keyof Date>} */ (
			Object.getOwnPropertyNames(Date.prototype).filter(
				(prop) => prop.startsWith('get') || prop.startsWith('to')
			)
		);

		var write = /** @type {Array<keyof Date>} */ (
			Object.getOwnPropertyNames(Date.prototype).filter((prop) => prop.startsWith('set'))
		);

		for (const method of read) {
			// @ts-ignore
			proto[method] = function (...args) {
				var sig = this.#signals.get(method);
				if (!sig) {
					sig = source(false);
					this.#signals.set(method, sig);
				}
				get(sig);
				// @ts-ignore
				return date_proto[method].apply(this, args);
			};
		}

		for (const method of write) {
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
			this.#increment_signal('getFullYear', 'getUTCFullYear');
			is_date_changed = true;
		}

		// @ts-expect-error
		if (super.getYear && super.getYear() !== this.#modified_date_to_compare.getYear()) {
			// @ts-expect-error
			this.#increment_signal('getYear');
			is_date_changed = true;
		}

		if (super.getMonth() !== this.#modified_date_to_compare.getMonth()) {
			this.#increment_signal('getMonth', 'getUTCMonth');
			is_date_changed = true;
		}

		if (super.getDate() !== this.#modified_date_to_compare.getDate()) {
			this.#increment_signal('getDate', 'getUTCDate');
			is_date_changed = true;
		}

		if (super.getDay() !== this.#modified_date_to_compare.getDay()) {
			this.#increment_signal('getDay', 'getUTCDay');
			is_date_changed = true;
		}

		if (super.getHours() !== this.#modified_date_to_compare.getHours()) {
			this.#increment_signal('getHours', 'getUTCHours');
			is_time_changed = true;
		}

		if (super.getMinutes() !== this.#modified_date_to_compare.getMinutes()) {
			this.#increment_signal('getMinutes', 'getUTCMinutes');
			is_time_changed = true;
		}

		if (super.getSeconds() !== this.#modified_date_to_compare.getSeconds()) {
			this.#increment_signal('getSeconds', 'getUTCSeconds');
			is_time_changed = true;
		}

		if (super.getMilliseconds() !== this.#modified_date_to_compare.getMilliseconds()) {
			this.#increment_signal('getMilliseconds', 'getUTCMilliseconds');
			is_time_changed = true;
		}

		if (is_time_changed) {
			this.#increment_signal('toTimeString', 'toLocaleTimeString');
		}

		if (is_date_changed) {
			this.#increment_signal('toDateString', 'toLocaleDateString');
		}

		if (is_time_changed || is_date_changed) {
			this.#increment_signal('getTimezoneOffset', 'getTime');
		}
	}

	/**
	 * @param  {...keyof Date} methods
	 */
	#increment_signal(...methods) {
		methods.forEach((method) => {
			var signal = this.#signals.get(method);
			if (!signal) {
				return;
			}
			// not using a number intentionally because its enough (it will increment the internal signal's version)
			set(signal, !signal.v);
		});
	}
}
