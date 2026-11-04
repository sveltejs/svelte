import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, window, warnings }) {
		const [input1, input2] = target.querySelectorAll('input');

		// `bind:contactInfo={$store.contactInfo}`
		input1.value = '2';
		input1.dispatchEvent(new window.Event('input', { bubbles: true }));
		flushSync();

		assert.htmlEqual(target.innerHTML, '<input><input><p>2</p><p>1</p>');

		// `bind:contactInfo={$store.rules[0].contactInfo}`
		input2.value = '3';
		input2.dispatchEvent(new window.Event('input', { bubbles: true }));
		flushSync();

		assert.htmlEqual(target.innerHTML, '<input><input><p>2</p><p>3</p>');

		// binding a property of a store value must not warn about a non-reactive property
		assert.deepEqual(warnings, []);
	}
});
