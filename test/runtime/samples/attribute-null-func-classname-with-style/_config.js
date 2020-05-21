export default {
	props: {
		testName: 'testClassName',
	},
	test({ assert, component, target }) {
		const div = target.querySelector('div');
		const startsWith = (str) => assert.ok(div.className.startsWith(str + ' svelte-'));
		startsWith('testClassName');

		component.testName = null;
		startsWith('');

		component.testName = undefined;
		startsWith('');

		component.testName = undefined + '';
		startsWith('undefined');

		component.testName = null + '';
		startsWith('null');

		component.testName = 1;
		startsWith('1');

		component.testName = 0;
		startsWith('0');

		component.testName = false;
		startsWith('false');

		component.testName = true;
		startsWith('true');

		component.testName = {};
		startsWith('[object Object]');

		component.testName = '';
		startsWith('');
	},
};
