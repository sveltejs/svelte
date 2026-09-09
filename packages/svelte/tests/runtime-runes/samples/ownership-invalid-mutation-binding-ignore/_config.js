import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true
	},
	test({ assert, target, warnings }) {
		const input = target.querySelector('input');
		const output = target.querySelector('p');
		ok(input);
		ok(output);

		input.value = 'renamed';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		assert.equal(output.textContent, 'renamed');
		assert.deepEqual(warnings, []);
	}
});
