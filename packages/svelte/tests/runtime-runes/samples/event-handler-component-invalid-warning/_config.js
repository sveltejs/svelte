import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings }) {
		/** @type {any} */
		let error;

		const handler = (/** @type {any}} */ e) => {
			error = e.error;
			e.stopImmediatePropagation();
		};

		window.addEventListener('error', handler, true);

		target.querySelector('button')?.click();

		assert.throws(() => {
			throw error;
		}, /state_unsafe_mutation/);

		window.removeEventListener('error', handler, true);

		assert.deepEqual(warnings, [
			'`click` handler at Button.svelte:5:9 should be a function. Did you mean to add a leading `() =>`?'
		]);
	}
});
