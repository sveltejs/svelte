import { test } from '../../test';
import { unmount } from 'svelte';

export default test({
	test({ component }) {
		unmount(component.l1);
	},

	warnings: ['Tried to unmount a component that was not mounted']
});
