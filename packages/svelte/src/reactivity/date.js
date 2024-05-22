import { make_reactive } from './utils.js';

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
	]
});
