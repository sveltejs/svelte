import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

export default test({
	html: '<custom><foreign-root><b>from renderer b</b></foreign-root></custom>',
	test({ assert, component, target, serialize }) {
		component.toggle();
		flushSync();
		assert.equal(serialize(target), '<custom></custom>');
	}
});
