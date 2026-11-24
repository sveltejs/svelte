import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

export default test({
	target: 'dom',
	html: '<custom-root><counter>0</counter></custom-root>',
	test({ assert, component, target, serialize_dom }) {
		// exports are returned through the crossing
		component.increment();
		flushSync();
		assert.equal(serialize_dom(target), '<custom-root><counter>1</counter></custom-root>');
	}
});
