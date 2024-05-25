import { make_reactive } from './utils.js';

const modified_date_to_compare = new Date();
/**
 * we have to create a new Date to compare, because setting `X` might or might not affect `Y`
 * for instance calling `date.setMonth(55)` will also change the `date.getYear()`
 * but calling `date.setMonth(1)` (assuming its not 12) will not increase the year.
 * we could check all of these edge-cases but I think that might become complicated very soon and introduce more bugs
 * also there is the possibility of these behaviors to change as well,
 * so creating a new date and applying the change is a better idea I guess
 * @param {import("./utils.js").InterceptorOptions<Date, (keyof Date)[], (keyof Date)[]>} options
 * @param {unknown[]} params
 * @return {boolean} - returns true if any changes happened
 */
const notify_datetime_changes = (options, ...params) => {
	modified_date_to_compare.setTime(options.value.getTime());

	let is_time_changed = false;
	let is_date_changed = false;

	// @ts-ignore
	modified_date_to_compare[options.property](...params);

	if (options.value.getFullYear() !== modified_date_to_compare.getFullYear()) {
		options.notify_read_properties(['getFullYear', 'getUTCFullYear']);
		is_date_changed = true;
	}

	// @ts-expect-error
	if (options.value.getYear && options.value.getYear() !== modified_date_to_compare.getYear()) {
		// @ts-expect-error
		options.notify_read_properties(['getYear']);
		is_date_changed = true;
	}

	if (options.value.getMonth() !== modified_date_to_compare.getMonth()) {
		options.notify_read_properties(['getMonth', 'getUTCMonth']);
		is_date_changed = true;
	}

	if (options.value.getDate() !== modified_date_to_compare.getDate()) {
		options.notify_read_properties(['getDate', 'getUTCDate']);
		is_date_changed = true;
	}

	if (options.value.getDay() !== modified_date_to_compare.getDay()) {
		options.notify_read_properties(['getDay', 'getUTCDay']);
		is_date_changed = true;
	}

	if (options.value.getHours() !== modified_date_to_compare.getHours()) {
		options.notify_read_properties(['getHours', 'getUTCHours']);
		is_time_changed = true;
	}

	if (options.value.getMinutes() !== modified_date_to_compare.getMinutes()) {
		options.notify_read_properties(['getMinutes', 'getUTCMinutes']);
		is_time_changed = true;
	}

	if (options.value.getSeconds() !== modified_date_to_compare.getSeconds()) {
		options.notify_read_properties(['getSeconds', 'getUTCSeconds']);
		is_time_changed = true;
	}

	if (options.value.getMilliseconds() !== modified_date_to_compare.getMilliseconds()) {
		options.notify_read_properties(['getMilliseconds', 'getUTCMilliseconds']);
		is_time_changed = true;
	}

	if (is_time_changed) {
		options.notify_read_properties(['toTimeString', 'toLocaleTimeString']);
	}

	if (is_date_changed) {
		options.notify_read_properties(['toDateString', 'toLocaleDateString']);
	}

	return is_date_changed || is_time_changed;
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
		setDate: (options, ...params) => notify_datetime_changes(options, ...params),
		setFullYear: (options, ...params) => notify_datetime_changes(options, ...params),
		setHours: (options, ...params) => notify_datetime_changes(options, ...params),
		setMilliseconds: (options, ...params) => notify_datetime_changes(options, ...params),
		setMinutes: (options, ...params) => notify_datetime_changes(options, ...params),
		setMonth: (options, ...params) => notify_datetime_changes(options, ...params),
		setSeconds: (options, ...params) => notify_datetime_changes(options, ...params),
		setTime: (options, ...params) => notify_datetime_changes(options, ...params),
		setUTCDate: (options, ...params) => notify_datetime_changes(options, ...params),
		setUTCFullYear: (options, ...params) => notify_datetime_changes(options, ...params),
		setUTCHours: (options, ...params) => notify_datetime_changes(options, ...params),
		setUTCMilliseconds: (options, ...params) => notify_datetime_changes(options, ...params),
		setUTCMinutes: (options, ...params) => notify_datetime_changes(options, ...params),
		setUTCMonth: (options, ...params) => notify_datetime_changes(options, ...params),
		setUTCSeconds: (options, ...params) => notify_datetime_changes(options, ...params),
		// @ts-expect-error - deprecated method
		setYear: (options, ...params) => {
			// it might be removed from browsers
			if (!options.value.getYear) {
				return false;
			}
			return notify_datetime_changes(options, ...params);
		}
	}
});
