import { make_reactive } from './utils.js';

export const ReactiveMap = make_reactive(Map, {
	write_properties: ['clear', 'delete', 'set'],
	read_properties: ['get', 'keys', 'size', 'entries', 'values'],
	interceptors: {
		set: (notify_read_methods, value, property, ...params) => {
			if (value.get(params[0]) === params[1] && params[1] !== undefined) {
				return false;
			}
			if (!value.has(params[0])) {
				notify_read_methods(['keys', 'size']);
			}
			notify_read_methods(['entries', 'values']);
			notify_read_methods(['get'], params[1]);
			return true;
		},
		clear: (notify_read_methods, value, property, ...params) => {
			if (value.size === 0) {
				return false;
			}
			notify_read_methods(['keys', 'size', 'values', 'entries']);
			return true;
		},
		delete: (notify_read_methods, value, property, ...params) => {
			if (!value.has(params[0])) {
				return false;
			}
			notify_read_methods(['get'], value.get(params[0]));
			notify_read_methods(['keys', 'size', 'values', 'entries']);
			return true;
		}
	}
});
