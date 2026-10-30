import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, variant, hydrate, window }) {
		const [input, current] = target.querySelectorAll('input');

		if (variant === 'hydrate') {
			current.value = 'before hydration';
			hydrate();
			flushSync();
		}

		assert.equal(input.value, 'after action');
		assert.equal(current.value, variant === 'hydrate' ? 'before hydration' : 'initial');

		target.querySelectorAll('button')[0].click();
		flushSync();
		assert.equal(current.value, 'replacement');

		current.value = 'after replacement';
		current.dispatchEvent(new window.Event('input'));
		flushSync();
		assert.equal(target.querySelectorAll('p')[0].textContent, 'after replacement');
	}
});
