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
		b2.click();
		b3.click();
		assert.deepEqual(logs, []);
		assert.deepEqual(warnings, [
			'`click` handler at main.svelte:7:17 should be a function. Did you mean to add a leading `() =>`?',
			'`click` handler at main.svelte:8:17 should be a function. Did you mean to add a leading `() =>`?',
			'`click` handler at main.svelte:9:17 should be a function. Did you mean to add a leading `() =>`?'
		]);
		assert.include(errors[0], 'is not a function');
		assert.include(errors[2], 'is not a function');
		assert.include(errors[4], 'is not a function');

		window.removeEventListener('error', handler, true);
	}
});
