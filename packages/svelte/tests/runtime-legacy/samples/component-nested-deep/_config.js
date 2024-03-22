import { test } from '../../test';
import { unmount } from 'svelte';

export default test({
	test({ component }) {
		unmount(component.l1);
	}
});
