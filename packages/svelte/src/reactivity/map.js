import { make_reactive } from './utils.js';

export const ReactiveMap = make_reactive(Map, {
	mutation_properties: ['clear', 'delete', 'set'],
	interceptors: {
		set: (value, property, ...params) => {
			return value.get(params[0]) !== params[2] || params[2] !== undefined;
		},
		clear: (value, property, ...params) => {
			return value.size !== 0;
		},
		delete: (value, property, ...params) => {
			return value.has(params[0]);
		}
	}
});
