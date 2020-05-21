export default {
	props: {
		testName1: 'test1',
		testName2: 'test2',
	},
	test({ assert, component, target }) {
		const div = target.querySelector('div');
		const startsWith = (str) => assert.ok(div.className.startsWith(str + ' svelte-'));
		startsWith('test1test2');

		component.testName1 = null;
		component.testName2 = null;
		startsWith('0');

		component.testName1 = null;
		component.testName2 = 'test';
		startsWith('nulltest');

		component.testName1 = undefined;
		component.testName2 = 'test';
		startsWith('undefinedtest');

		component.testName1 = undefined;
		component.testName2 = undefined;
		startsWith('NaN');

		component.testName1 = null;
		component.testName2 = 1;
		startsWith('1');

		component.testName1 = undefined;
		component.testName2 = 1;
		startsWith('NaN');

		component.testName1 = null;
		component.testName2 = 0;
		startsWith('0');

		component.testName1 = undefined;
		component.testName2 = 0;
		startsWith('NaN');
	},
};
