import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true
	},

	async test({ assert, target }) {
		await tick();

		const errors = target.querySelectorAll('.error');
		assert.equal(errors.length, 10);
		for (const error of errors) {
			assert.equal(error.textContent, 'state_unsafe_mutation');
		}

		const [stateless] = target.querySelectorAll('.stateless');
		assert.htmlEqual(stateless.innerHTML, '1');

		const [allowed] = target.querySelectorAll('.allowed');
		assert.htmlEqual(allowed.innerHTML, 'allowed');

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '0:0');

		const [button] = target.querySelectorAll('button');
		flushSync(() => button.click());
		assert.htmlEqual(output.innerHTML, '1:0');
	}
});
