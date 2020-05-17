export default {
	test({ assert, component, target }) {
		const div = target.querySelector('div');

		component.testName = null;
		const startsWith = (str) => assert.ok(div.className.startsWith(str));
		startsWith(' svelte-');

		component.testName = undefined;
		startsWith(' svelte-');

		component.testName = undefined + '';
		startsWith('undefined svelte-');

		component.testName = null + '';
		startsWith('null svelte-');

		component.testName = 1;
		startsWith('1 svelte-');

		component.testName = 0;
		startsWith('0 svelte-');

		component.testName = false;
		startsWith('false svelte-');

		component.testName = true;
		startsWith('true svelte-');

		component.testName = {};
		startsWith('[object Object] svelte-');

		component.testName = '';
		startsWith(' svelte-');

		component.testName = 'testClassName';
		startsWith('testClassName svelte-');
	},
};
