export default {
	get props() {
		return { testName: 'testClassName' };
	},

	html: '<div class="testClassName svelte-x1o6ra"></div>',

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		assert.equal(div.className, 'testClassName svelte-x1o6ra');

		component.testName = null;
		assert.equal(div.className, ' svelte-x1o6ra');

		component.testName = undefined;
		assert.equal(div.className, ' svelte-x1o6ra');

		component.testName = undefined + '';
		assert.equal(div.className, 'undefined svelte-x1o6ra');

		component.testName = null + '';
		assert.equal(div.className, 'null svelte-x1o6ra');

		component.testName = 1;
		assert.equal(div.className, '1 svelte-x1o6ra');

		component.testName = 0;
		assert.equal(div.className, '0 svelte-x1o6ra');

		component.testName = false;
		assert.equal(div.className, 'false svelte-x1o6ra');

		component.testName = true;
		assert.equal(div.className, 'true svelte-x1o6ra');

		component.testName = {};
		assert.equal(div.className, '[object Object] svelte-x1o6ra');

		component.testName = '';
		assert.equal(div.className, ' svelte-x1o6ra');
	}
};
