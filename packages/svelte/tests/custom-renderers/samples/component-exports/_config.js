import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<p>0</p>',
	test({ assert, target, component, serialize }) {
		// Component exports should be accessible
		assert.ok(typeof component.increment === 'function', 'increment should be exported');
		assert.ok(typeof component.get_count === 'function', 'get_count should be exported');

		// Verify initial state
		assert.equal(component.get_count(), 0);

		// Call exported function and verify it updates state
		component.increment();
		flushSync();

		assert.equal(component.get_count(), 1);
		assert.equal(serialize(target), '<p>1</p>');

		// Call it a few more times
		component.increment();
		component.increment();
		flushSync();

		assert.equal(component.get_count(), 3);
		assert.equal(serialize(target), '<p>3</p>');
	}
});
