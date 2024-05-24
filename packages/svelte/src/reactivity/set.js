import { make_reactive, NOTIFY_WITH_ALL_REGISTERED_PARAMS } from './utils.js';

export const ReactiveSet = make_reactive(Set, {
	write_properties: ['add', 'clear', 'delete'],
	read_properties: ['has'],
	interceptors: {
		add: (options, ...params) => {
			if (options.value.has(params[0])) {
				return false;
			}
			options.notify_read_properties(['has'], params[0]);
			return true;
		},
		clear: (options, ...params) => {
			if (options.value.size == 0) {
				return false;
			}
			// get_registered_params('has').forEach((param) => {
			// 	notify_read_properties(['has'], param);
			// });
			options.notify_read_properties(['has'], NOTIFY_WITH_ALL_REGISTERED_PARAMS);
			return true;
		},
		delete: (options, ...params) => {
			if (!options.value.has(params[0])) {
				return false;
			}
			options.notify_read_properties(['has'], params[0]);
			return true;
		}
	}
});
