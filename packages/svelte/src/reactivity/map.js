import { make_reactive, NOTIFY_WITH_ALL_PARAMS } from './utils.js';

export const ReactiveMap = make_reactive(Map, {
	write_properties: ['clear', 'delete', 'set'],
	read_properties: ['get', 'keys', 'entries', 'values', 'has'],
	interceptors: {
		set: (notify_read_methods, value, property, ...params) => {
			if (value.get(params[0]) === params[1]) {
				return false;
			}
			if (!value.has(params[0])) {
				notify_read_methods(['keys']);
			}
			notify_read_methods(['entries', 'values']);
			notify_read_methods(['get', 'has'], params[1]);
			return true;
		},
		clear: (notify_read_methods, value, property, ...params) => {
			if (value.size === 0) {
				return false;
			}
			notify_read_methods(['keys', 'values', 'entries', 'has'], NOTIFY_WITH_ALL_PARAMS);
			return true;
		},
		delete: (notify_read_methods, value, property, ...params) => {
			if (!value.has(params[0])) {
				return false;
			}
			notify_read_methods(['get', 'has'], params[0]);
			notify_read_methods(['keys', 'values', 'entries']);
			return true;
		}
	}
});
