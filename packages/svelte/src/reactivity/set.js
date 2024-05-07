import { make_reactive } from './utils.js';

export const ReactiveSet = make_reactive(Set, {
	mutation_properties: /** @type {const} */ (['add', 'clear', 'delete']),
	interceptors: {
		add: (value, property, ...params) => {
			return !value.has(params[0]);
		},
		clear: (value, property, ...params) => {
			return value.size !== 0;
		},
		delete: (value, property, ...params) => {
			return !value.has(params[0]);
		}
	}
});
