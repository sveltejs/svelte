import { make_reactive } from './utils.js';

/**
 * we have to create a new Date to compare, because setting `X` might or might not affect `Y`
 * for instance calling `date.setMonth(55)` will also change the `date.getYear()`
 * but calling `date.setMonth(1)` (assuming its not 12) will not increase the year.
 * we could check all of these edge-cases but I think that might become complicated very soon and introduce more bugs
 * also there is the possibility of these behaviors to change as well,
 * so creating a new date and applying the change is a better idea I guess
 * @param {Date} current_datetime
 * @param {Date} new_datetime
 * @param {import("./utils.js").InterceptorOptions<Date, (keyof Date)[], (keyof Date)[]>["notify_read_properties"]} notify_read_properties
 * @return {boolean} - returns true if any changes happened
 */
const notify_datetime_changes = (current_datetime, new_datetime, notify_read_properties) => {
	let had_time_changes = false;
	let had_date_changes = false;

	if (current_datetime.getFullYear() !== new_datetime.getFullYear()) {
		notify_read_properties(['getFullYear', 'getUTCFullYear']);
		had_date_changes = true;
	}

	// @ts-expect-error
	if (current_datetime.getYear && current_datetime.getYear() !== new_datetime.getYear()) {
		// @ts-expect-error
		notify_read_properties(['getYear']);
		had_date_changes = true;
	}

	if (current_datetime.getMonth() !== new_datetime.getMonth()) {
		notify_read_properties(['getMonth', 'getUTCMonth']);
		had_date_changes = true;
	}

	if (current_datetime.getDay() !== new_datetime.getDay()) {
		notify_read_properties(['getDay', 'getUTCDay']);
		had_date_changes = true;
	}

	if (current_datetime.getHours() !== new_datetime.getHours()) {
		notify_read_properties(['getHours', 'getUTCHours']);
		had_time_changes = true;
	}

	if (current_datetime.getMinutes() !== new_datetime.getMinutes()) {
		notify_read_properties(['getMinutes', 'getUTCMinutes']);
		had_time_changes = true;
	}

	if (current_datetime.getSeconds() !== new_datetime.getSeconds()) {
		notify_read_properties(['getSeconds', 'getUTCSeconds']);
		had_time_changes = true;
	}

	if (current_datetime.getMilliseconds() !== new_datetime.getMilliseconds()) {
		notify_read_properties(['getMilliseconds', 'getUTCMilliseconds']);
		had_time_changes = true;
	}

	if (had_time_changes) {
		notify_read_properties(['toTimeString', 'toLocaleTimeString']);
	}

	if (had_date_changes) {
		notify_read_properties(['toDateString', 'toLocaleDateString']);
	}

	return had_date_changes || had_time_changes;
};

export const ReactiveDate = make_reactive(Date, {
	write_properties: [
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
		// @ts-expect-error this is deprecated
		'setYear'
	],
	read_properties: [
		'getDate',
		'getDay',
		'getFullYear',
		'getHours',
		'getMilliseconds',
		'getMinutes',
		'getMonth',
		'getSeconds',
		'getTimezoneOffset',
		'getUTCDate',
		'getUTCDay',
		'getUTCFullYear',
		'getUTCHours',
		'getUTCMilliseconds',
		'getUTCMinutes',
		'getUTCMonth',
		'getUTCSeconds',
		// @ts-expect-error this is deprecated
		'getYear',
		'toDateString',
		'toLocaleDateString',
		'toTimeString',
		'toLocaleTimeString'
	],
	interceptors: {
		setDate: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setDate(/**@type {number}*/ (params[0]));
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setFullYear: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setFullYear(
				/**@type {number}*/ (params[0]),
				/**@type {number | undefined}*/ (params[1]),
				/**@type {number | undefined}*/ (params[2])
			);
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setHours: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setHours(
				/**@type {number}*/ (params[0]),
				/**@type {number | undefined}*/ (params[1]),
				/**@type {number | undefined}*/ (params[2]),
				/**@type {number | undefined}*/ (params[3])
			);
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setMilliseconds: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setMilliseconds(/**@type {number}*/ (params[0]));
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setMinutes: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setMinutes(
				/**@type {number}*/ (params[0]),
				/**@type {number | undefined}*/ (params[1]),
				/**@type {number | undefined}*/ (params[2])
			);
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setMonth: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setMonth(/**@type {number}*/ (params[0]), /**@type {number | undefined}*/ (params[1]));
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setSeconds: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setSeconds(/**@type {number}*/ (params[0]), /**@type {number | undefined}*/ (params[1]));
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setTime: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setTime(/**@type {number}*/ (params[0]));
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setUTCDate: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setUTCDate(/**@type {number}*/ (params[0]));
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setUTCFullYear: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setUTCFullYear(
				/**@type {number}*/ (params[0]),
				/**@type {number | undefined}*/ (params[1]),
				/**@type {number | undefined}*/ (params[2])
			);
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setUTCHours: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setUTCHours(
				/**@type {number}*/ (params[0]),
				/**@type {number | undefined}*/ (params[1]),
				/**@type {number | undefined}*/ (params[2]),
				/**@type {number | undefined}*/ (params[3])
			);
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setUTCMilliseconds: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setUTCMilliseconds(/**@type {number}*/ (params[0]));
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setUTCMinutes: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setUTCMinutes(
				/**@type {number}*/ (params[0]),
				/**@type {number | undefined}*/ (params[1]),
				/**@type {number | undefined}*/ (params[2])
			);
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setUTCMonth: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setUTCMonth(/**@type {number}*/ (params[0]), /**@type {number | undefined}*/ (params[1]));
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		setUTCSeconds: (options, ...params) => {
			const tmp = new Date(options.value);
			tmp.setUTCSeconds(
				/**@type {number}*/ (params[0]),
				/**@type {number | undefined}*/ (params[1])
			);
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		},
		// @ts-expect-error - deprecated method
		setYear: (options, ...params) => {
			// it might be removed from browsers
			if (!options.value.getYear) {
				return false;
			}
			const tmp = new Date(options.value);
			// @ts-expect-error
			tmp.setYear(/**@type {number}*/ (params[0]));
			return notify_datetime_changes(options.value, tmp, options.notify_read_properties);
		}
	}
});
