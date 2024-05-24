import { make_reactive } from './utils.js';

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
			options.get_registered_params('has')?.forEach((value, param) => {
				// because we don't want to notify `has` for items that are currently not in the set
				if (!options.value.has(param)) {
					return;
				}
				options.notify_read_properties(['has'], param);
			});
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
