import { writable } from 'svelte/store';

export default {
	props: {
		b: writable(42)
	},

	html: `
		42
	`
};
