import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, window }) {
		const [input1, input2] = target.querySelectorAll('input');
		assert.equal(input1.value, 'something');
		assert.equal(input2.value, 'something');

		input1.value = 'abc';

		input1.dispatchEvent(new window.Event('input'));
		flushSync();
		assert.equal(input1.value, 'abc');
		assert.equal(input2.value, 'abc');

		target
			.querySelector('button')
			?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		flushSync();

		assert.equal(input1.value, 'Reset');
		assert.equal(input2.value, 'Reset');
	}
});
