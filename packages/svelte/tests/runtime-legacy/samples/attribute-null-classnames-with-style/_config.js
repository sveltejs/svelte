import { ok, test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {any} */
			testName1: 'test1',
			/** @type {any} */
			testName2: 'test2'
		};
	},

	html: '<div class="test1test2 svelte-70s021"></div>',

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		ok(div);
		assert.equal(div.className, 'test1test2 svelte-70s021');

		component.testName1 = null;
		component.testName2 = null;
		assert.equal(div.className, '0 svelte-70s021');

		component.testName1 = null;
		component.testName2 = 'test';
		assert.equal(div.className, 'nulltest svelte-70s021');

		component.testName1 = undefined;
		component.testName2 = 'test';
		assert.equal(div.className, 'undefinedtest svelte-70s021');

		component.testName1 = undefined;
		component.testName2 = undefined;
		assert.equal(div.className, 'NaN svelte-70s021');

		component.testName1 = null;
		component.testName2 = 1;
		assert.equal(div.className, '1 svelte-70s021');

		component.testName1 = undefined;
		component.testName2 = 1;
		assert.equal(div.className, 'NaN svelte-70s021');

		component.testName1 = null;
		component.testName2 = 0;
		assert.equal(div.className, '0 svelte-70s021');

		component.testName1 = undefined;
		component.testName2 = 0;
		assert.equal(div.className, 'NaN svelte-70s021');
	}
});
