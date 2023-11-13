import { ok, test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {string | number | null | undefined} */
			testName1: 'test1',
			/** @type {string | number | null | undefined} */
			testName2: 'test2'
		};
	},

	html: '<div class="test1test2 svelte-x1o6ra"></div>',

	async test({ assert, component, target }) {
		const div = target.querySelector('div');
		ok(div);
		assert.equal(div.className, 'test1test2 svelte-x1o6ra');

		component.testName1 = null;
		component.testName2 = null;
		assert.equal(div.className, '0 svelte-x1o6ra');

		component.testName1 = null;
		component.testName2 = 'test';
		assert.equal(div.className, 'nulltest svelte-x1o6ra');

		component.testName1 = undefined;
		component.testName2 = 'test';
		assert.equal(div.className, 'undefinedtest svelte-x1o6ra');

		component.testName1 = undefined;
		component.testName2 = undefined;
		assert.equal(div.className, 'NaN svelte-x1o6ra');

		component.testName1 = null;
		component.testName2 = 1;
		assert.equal(div.className, '1 svelte-x1o6ra');

		component.testName1 = undefined;
		component.testName2 = 1;
		assert.equal(div.className, 'NaN svelte-x1o6ra');

		component.testName1 = null;
		component.testName2 = 0;
		assert.equal(div.className, '0 svelte-x1o6ra');

		component.testName1 = undefined;
		component.testName2 = 0;
		assert.equal(div.className, 'NaN svelte-x1o6ra');
	}
});
