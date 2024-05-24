import { make_reactive } from './utils.js';

export const ReactiveURLSearchParams = make_reactive(URLSearchParams, {
	write_properties: ['append', 'delete', 'set', 'sort'],
	read_properties: ['get', 'has', 'getAll'],
	interceptors: {
		set: (options, ...params) => {
			if (typeof params[0] == 'string' && options.value.get(params[0]) === params[1]) {
				return false;
			}
			options.notify_read_properties(['get', 'has', 'getAll'], params[0]);
			return true;
		},
		append: (options, ...params) => {
			options.notify_read_properties(['getAll'], params[0]);

			if (typeof params[0] == 'string' && !options.value.has(params[0])) {
				options.notify_read_properties(['get', 'has'], params[0]);
			}
			return true;
		},
		delete: (options, ...params) => {
			if (typeof params[0] == 'string' && !options.value.has(params[0])) {
				return false;
			}
			options.notify_read_properties(['get', 'has', 'getAll'], params[0]);
			return true;
		}
	}
});
