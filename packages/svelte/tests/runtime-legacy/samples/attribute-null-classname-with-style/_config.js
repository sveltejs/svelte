import { ok, test } from '../../test';

export default test({
	html: '<div class="svelte-1bl4vl5"></div>',

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		ok(div);

		component.testName = null;
		assert.equal(div.className, 'svelte-1bl4vl5');

		component.testName = undefined;
		assert.equal(div.className, 'svelte-1bl4vl5');

		component.testName = undefined + '';
		assert.equal(div.className, 'undefined svelte-1bl4vl5');

		component.testName = null + '';
		assert.equal(div.className, 'null svelte-1bl4vl5');

		component.testName = 1;
		assert.equal(div.className, '1 svelte-1bl4vl5');

		component.testName = 0;
		assert.equal(div.className, '0 svelte-1bl4vl5');

		component.testName = false;
		assert.equal(div.className, 'false svelte-1bl4vl5');

		component.testName = true;
		assert.equal(div.className, 'true svelte-1bl4vl5');

		component.testName = {};
		assert.equal(div.className, 'svelte-1bl4vl5');

		component.testName = '';
		assert.equal(div.className, 'svelte-1bl4vl5');

		component.testName = 'testClassName';
		assert.equal(div.className, 'testClassName svelte-1bl4vl5');
	}
});
