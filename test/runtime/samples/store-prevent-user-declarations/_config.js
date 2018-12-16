import { writable } from '../../../../store.js';

export default {
	props: {
		count: writable(0)
	},

	error: `The $ prefix is reserved, and cannot be used for variable and import names`
};