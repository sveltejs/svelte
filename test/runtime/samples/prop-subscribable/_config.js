import { writable } from '../../../../store';

export default {
	props: {
		b: writable(42)
	},

	html: `
		42
	`
};