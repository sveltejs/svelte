import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

export default test({
	hydrate: true,
	test({ assert, component, target, warnings }) {
		assert.instanceOf(target, HTMLElement);
		assert.deepEqual(warnings, []);
		assert.ok(target.querySelector('#keep-me'));
		assert.ok(target.querySelector('custom-rendered'));

		component.hide();
		flushSync();

		assert.ok(target.querySelector('#keep-me'));
		assert.equal(target.querySelector('custom-rendered'), null);
		assert.notInclude(target.textContent, 'Cool:');

		component.show();
		flushSync();

		assert.ok(target.querySelector('#keep-me'));
		assert.ok(target.querySelector('custom-rendered'));
	}
});
