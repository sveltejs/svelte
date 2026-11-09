import { flushSync } from 'svelte';
import { test } from '../../test';

// Like `effect-eager-each-removed-item`, for an `{#if}` branch: the effect inside it would
// read `obj.name` after `obj` was set to `null`
export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		assert.deepEqual([...logs], ['item effect: go=false name=a']);

		flushSync(() => target.querySelector('button')?.click());

		assert.deepEqual([...logs], ['item effect: go=false name=a']);
		assert.htmlEqual(target.innerHTML, '<button>go</button>');
	}
});
