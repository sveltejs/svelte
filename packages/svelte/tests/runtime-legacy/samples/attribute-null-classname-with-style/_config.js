import { ok, test } from '../../test';

export default test({
	html: '<div class="svelte-70s021"></div>',

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		ok(div);

		component.testName = null;
		assert.equal(div.className, 'svelte-70s021');

		component.testName = undefined;
		assert.equal(div.className, 'svelte-70s021');

		component.testName = undefined + '';
		assert.equal(div.className, 'undefined svelte-70s021');

		component.testName = null + '';
		assert.equal(div.className, 'null svelte-70s021');

		component.testName = 1;
		assert.equal(div.className, '1 svelte-70s021');

		component.testName = 0;
		assert.equal(div.className, '0 svelte-70s021');

		component.testName = false;
		assert.equal(div.className, 'false svelte-70s021');

		component.testName = true;
		assert.equal(div.className, 'true svelte-70s021');

		component.testName = {};
		assert.equal(div.className, 'svelte-70s021');

		component.testName = '';
		assert.equal(div.className, 'svelte-70s021');

		component.testName = 'testClassName';
		assert.equal(div.className, 'testClassName svelte-70s021');
	}
});
