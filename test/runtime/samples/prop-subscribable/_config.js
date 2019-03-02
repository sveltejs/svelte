import { writable } from '../../../../store.js';

export default {
	props: {
		b: writable(42)
	},

	html: `
		42
	`
};