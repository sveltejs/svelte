import { test } from '../../test';
import { unmount } from 'svelte';

export default test({
	test({ component }) {
		unmount(component);
		unmount(component);
	},

	warnings: [
		'Tried to unmount a component that was not mounted.',
		'Tried to unmount a component that was not mounted.'
	]
});
