import { make_reactive, NOTIFY_WITH_ALL_REGISTERED_PARAMS } from './utils.js';

export const ReactiveMap = make_reactive(Map, {
	write_properties: ['clear', 'delete', 'set'],
	read_properties: ['get', 'keys', 'has'],
	interceptors: {
		set: (options, ...params) => {
			if (options.value.get(params[0]) === params[1]) {
				return false;
			}
			if (!options.value.has(params[0])) {
				options.notify_read_properties(['keys']);
			}
			options.notify_read_properties(['get', 'has'], params[0]);
			return true;
		},
		clear: (options, ...params) => {
			if (options.value.size === 0) {
				return false;
			}
			options.notify_read_properties(['get', 'keys', 'has'], NOTIFY_WITH_ALL_REGISTERED_PARAMS);
			return true;
		},
		delete: (options, ...params) => {
			if (!options.value.has(params[0])) {
				return false;
			}
			options.notify_read_properties(['get', 'has'], params[0]);
			options.notify_read_properties(['keys']);
			return true;
		}
	}
});
