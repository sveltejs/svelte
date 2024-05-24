import { make_reactive } from './utils.js';

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

			options.get_registered_params('has')?.forEach((value, param) => {
				// because we don't want to notify `has` for items that are currently not in the map
				if (!options.value.has(param)) {
					return;
				}
				options.notify_read_properties(['has'], param);
			});

			options.get_registered_params('get')?.forEach((value, param) => {
				// because we don't want to notify `get` for items that are currently not in the map
				if (!options.value.has(param)) {
					return;
				}
				options.notify_read_properties(['get'], param);
			});

			options.notify_read_properties(['keys']);
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
