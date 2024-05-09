import { make_reactive } from './utils.js';

export const ReactiveSet = make_reactive(Set, {
	mutation_properties: ['add', 'clear', 'delete'],
	read_properties: ['has', 'size'],
	interceptors: {
		add: (notify_read_methods, value, property, ...params) => {
			if (value.has(params[0])) {
				return false;
			}
			notify_read_methods(['has'], params[0]);
			notify_read_methods(['size']);
			return true;
		},
		clear: (notify_read_methods, value, property, ...params) => {
			if (value.size == 0) {
				return false;
			}
			notify_read_methods(['has'], params[0]);
			notify_read_methods(['size']);
			return true;
		},
		delete: (notify_read_methods, value, property, ...params) => {
			if (!value.has(params[0])) {
				return false;
			}
			notify_read_methods(['has'], params[0]);
			notify_read_methods(['size']);
			return true;
		}
	}
});
