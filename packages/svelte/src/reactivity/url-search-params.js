import { make_reactive } from './utils.js';

export const ReactiveURLSearchParams = make_reactive(URLSearchParams, {
	write_properties: ['append', 'delete', 'set', 'sort'],
	read_properties: ['get', 'has'],
	interceptors: {
		set: (notify_read_properties, value, property, ...params) => {
			if (typeof params[0] == 'string' && value.get(params[0]) === params[1]) {
				return false;
			}
			notify_read_properties(['get', 'has'], params[0]);
			return true;
		},
		append: (notify_read_properties, value, property, ...params) => {
			if (typeof params[0] == 'string' && value.get(params[0]) === params[1]) {
				return false;
			}
			notify_read_properties(['get', 'has'], params[0]);
			return true;
		},
		delete: (notify_read_properties, value, property, ...params) => {
			if (typeof params[0] == 'string' && !value.has(params[0])) {
				return false;
			}
			notify_read_properties(['get', 'has'], params[0]);
			return true;
		}
	}
});
