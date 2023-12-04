import { test } from '../../test';
import { writable } from 'svelte/store';

export default test({
	get props() {
		return { b: writable(42) };
	},

	html: `
		42
	`
});
