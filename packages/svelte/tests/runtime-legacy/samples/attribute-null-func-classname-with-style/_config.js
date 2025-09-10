import { ok, test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {any} */
			testName: 'testClassName'
		};
	},

	html: '<div class="testClassName svelte-zab9z2"></div>',

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		ok(div);
		assert.equal(div.className, 'testClassName svelte-zab9z2');

		component.testName = null;
		assert.equal(div.className, 'svelte-zab9z2');

		component.testName = undefined;
		assert.equal(div.className, 'svelte-zab9z2');

		component.testName = undefined + '';
		assert.equal(div.className, 'undefined svelte-zab9z2');

		component.testName = null + '';
		assert.equal(div.className, 'null svelte-zab9z2');

		component.testName = 1;
		assert.equal(div.className, '1 svelte-zab9z2');

		component.testName = 0;
		assert.equal(div.className, '0 svelte-zab9z2');

		component.testName = false;
		assert.equal(div.className, 'false svelte-zab9z2');

		component.testName = true;
		assert.equal(div.className, 'true svelte-zab9z2');

		component.testName = {};
		assert.equal(div.className, 'svelte-zab9z2');

		component.testName = '';
		assert.equal(div.className, 'svelte-zab9z2');
	}
});
