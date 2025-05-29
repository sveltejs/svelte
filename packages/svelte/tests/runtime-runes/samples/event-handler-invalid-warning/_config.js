import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings, errors }) {
		const handler = (/** @type {any} */ e) => {
			e.stopImmediatePropagation();
		};

		window.addEventListener('error', handler, true);

		target.querySelector('button')?.click();

		assert.include(errors[0], 'state_unsafe_mutation');

		window.removeEventListener('error', handler, true);

		assert.deepEqual(warnings, [
			'`click` handler at main.svelte:9:17 should be a function. Did you mean to remove the trailing `()`?'
		]);
	}
});
