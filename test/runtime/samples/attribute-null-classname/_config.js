export default {
	skip_if_ssr: true,

	props: {
		testName: "testClassName"
	},

	html: `<div class="testClassName svelte-x1o6ra"></div>`,

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

		component.testName = '';
		assert.equal(div.className, ' svelte-x1o6ra');
	}
};
