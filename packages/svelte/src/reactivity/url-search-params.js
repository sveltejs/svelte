import { make_reactive } from './utils.js';

export const ReactiveURLSearchParams = make_reactive(URLSearchParams, {
	write_properties: ['append', 'delete', 'set', 'sort'],
	read_properties: ['get', 'has', 'getAll'],
	interceptors: {
		set: (options, ...params) => {
			const value = options.value.get(/**@type {string} */ (params[0]));
			const value_has_changed = value !== /**@type {string} */ (params[1]).toString();

			if (value && !value_has_changed) {
				return false;
			}

			if (!value) {
				options.notify_read_properties(['has'], params[0]);
			}

			if (value_has_changed) {
				options.notify_read_properties(['get'], params[0]);
			}

			options.notify_read_properties(['getAll'], params[0]);

			return true;
		},
		append: (options, ...params) => {
			options.notify_read_properties(['getAll'], params[0]);

			if (!options.value.has(/**@type {string} */ (params[0]))) {
				options.notify_read_properties(['get', 'has'], params[0]);
			}
			return true;
		},
		delete: (options, ...params) => {
			if (!options.value.has(/**@type {string} */ (params[0]))) {
				return false;
			}
			options.notify_read_properties(['get', 'has', 'getAll'], params[0]);
			return true;
		}
	}
});
