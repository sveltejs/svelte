import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ assert, warnings }) {
		assert.include(warnings[0], "Duplicate attribute 'foo' across multiple `<svelte:html>` blocks");
		assert.deepEqual(document.documentElement.getAttribute('foo'), 'bar');
		assert.deepEqual(document.documentElement.getAttribute('class'), 'foo bar foo baz');

		const [btn1, btn2] = document.querySelectorAll('button');

		btn1.click();
		flushSync();
		assert.deepEqual(document.documentElement.getAttribute('foo'), 'foo');
		assert.deepEqual(document.documentElement.getAttribute('class'), 'foo bar');

		btn1.click();
		flushSync();
		assert.deepEqual(document.documentElement.getAttribute('foo'), 'bar');
		assert.deepEqual(document.documentElement.getAttribute('class'), 'foo bar foo baz');

		btn2.click();
		flushSync();
		assert.deepEqual(document.documentElement.getAttribute('foo'), 'top0');

		btn1.click();
		flushSync();
		assert.deepEqual(document.documentElement.getAttribute('foo'), 'top0');

		btn1.click();
		flushSync();
		assert.deepEqual(document.documentElement.getAttribute('foo'), 'bar');

		document.querySelectorAll('button')[2].click();
		flushSync();
		assert.deepEqual(document.documentElement.getAttribute('foo'), 'nested0');

		btn1.click();
		flushSync();
		assert.deepEqual(document.documentElement.getAttribute('foo'), 'top0');
	}
});
