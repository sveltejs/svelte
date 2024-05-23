import { make_reactive, NOTIFY_WITH_ALL_REGISTERED_PARAMS } from './utils.js';

export const ReactiveSet = make_reactive(Set, {
	write_properties: ['add', 'clear', 'delete'],
	read_properties: ['has'],
	interceptors: {
		add: (notify_read_properties, value, property, ...params) => {
			if (value.has(params[0])) {
				return false;
			}
			notify_read_properties(['has'], params[0]);
			return true;
		},
		clear: (notify_read_properties, value, property, ...params) => {
			if (value.size == 0) {
				return false;
			}
			notify_read_properties(['has'], NOTIFY_WITH_ALL_REGISTERED_PARAMS);
			return true;
		},
		delete: (notify_read_properties, value, property, ...params) => {
			if (!value.has(params[0])) {
				return false;
			}
			notify_read_properties(['has'], params[0]);
			return true;
		}
	}
});
