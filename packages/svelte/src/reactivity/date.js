import { make_reactive } from './utils.js';

/**
 * @type {(keyof Date)[]}
 */
const write_properties = /** @type {const} */ ([
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
]);

/**
 * @type {(keyof Date)[]}
 */
const read_properties = /** @type {const} */ ([
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
	'toLocaleTimeString',
	'toTimeString'
]);

/**
 * @type {Record<(typeof write_properties)[number], (typeof read_properties)[number][]>}
 */
const affected_changes = {
	setDate: ['getDate', 'getUTCDate', 'toDateString', 'toLocaleDateString'],
	setFullYear: [
		'getFullYear',
		'getUTCFullYear',
		'getDate',
		'getUTCDate',
		'toDateString',
		'toLocaleDateString'
	],
	setHours: ['getHours', 'getUTCHours', 'toTimeString', 'toLocaleTimeString'],
	setMilliseconds: ['getMilliseconds', 'getUTCMilliseconds', 'toTimeString', 'toLocaleTimeString'],
	setMinutes: [
		'getMinutes',
		'getUTCMinutes',
		'getHours',
		'getUTCHours',
		'toTimeString',
		'toLocaleTimeString'
	],
	setMonth: [
		'getMonth',
		'getUTCMonth',
		'getDate',
		'getUTCDate',
		'toDateString',
		'toLocaleDateString'
	],
	setSeconds: ['getSeconds', 'getUTCSeconds', 'toTimeString', 'toLocaleTimeString'],
	setTime: [
		'toDateString',
		'toTimeString',
		'toLocaleDateString',
		'toLocaleTimeString',
		'getFullYear',
		'getMonth',
		'getDate',
		'getHours',
		'getMinutes',
		'getSeconds',
		'getMilliseconds',
		'getUTCFullYear',
		'getUTCMonth',
		'getUTCDate',
		'getUTCHours',
		'getUTCMinutes',
		'getUTCSeconds',
		'getUTCMilliseconds'
	],
	setUTCDate: ['getUTCDate', 'getDate'],
	setUTCFullYear: ['getUTCFullYear', 'getFullYear', 'getUTCDate', 'getDate'],
	setUTCHours: ['getUTCHours', 'getHours'],
	setUTCMilliseconds: ['getUTCMilliseconds', 'getMilliseconds'],
	setUTCMinutes: ['getUTCMinutes', 'getMinutes', 'getUTCHours', 'getHours'],
	setUTCMonth: ['getUTCMonth', 'getMonth', 'getUTCDate', 'getDate'],
	setUTCSeconds: ['getUTCSeconds', 'getSeconds'],
	// @ts-expect-error
	setYear: ['getYear', 'getFullYear', 'toDateString']
};

/**
 * @typedef {import("./utils.js").Interceptors<InstanceType<Date>, typeof write_properties, typeof read_properties>} ReactiveDateInterceptor
 */

export const ReactiveDate = make_reactive(Date, {
	write_properties: write_properties,
	read_properties: read_properties,
	// @ts-expect-error - because of `setYear` which deprecated all types are screwed so have to compromise
	interceptors: {
		...write_properties.map((write_property) => {
			return /** @type {import("./utils.js").Interceptors<InstanceType<Date>, typeof write_properties, typeof read_properties>} */ ({
				/**
				 * @param {import("./utils.js").InterceptorOptions<InstanceType<Date>, typeof write_properties, typeof read_properties>} options
				 * @param {unknown[]} params
				 **/
				[write_property]: (options, ...params) => {
					if (options.value[write_property]() === params[0]) {
						return false;
					}
					affected_changes[write_property].forEach((affected) => {
						options.notify_read_properties([affected]);
					});
					return true;
				}
			});
		})
	}
});
