import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings, logs, errors }) {
		const handler = (/** @type {any} */ e) => {
			e.stopImmediatePropagation();
		};

		window.addEventListener('error', handler, true);

		const [b1, b2, b3] = target.querySelectorAll('button');

		b1.click();
		assert.deepEqual(logs, []);
		assert.deepEqual(errors, []);

		b2.click();
		assert.deepEqual(logs, ['clicked']);
		assert.deepEqual(errors, []);

		logs.length = 0;

		b3.click();
		assert.deepEqual(logs, []);
		assert.deepEqual(warnings, [
			'`click` handler at main.svelte:10:17 should be a function. Did you mean to add a leading `() =>`?'
		]);
		assert.include(errors[0], 'is not a function');

		window.removeEventListener('error', handler, true);
	}
});
