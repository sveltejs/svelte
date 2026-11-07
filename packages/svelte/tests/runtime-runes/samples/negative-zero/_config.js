import { flushSync } from 'svelte';
import { test, ok } from '../../test';

export default test({
	html: `
		<p>-Infinity</p>
		<p>-Infinity</p>
		<p>-Infinity</p>
		<p>-Infinity</p>
		<p>-Infinity</p>
		<p>-Infinity</p>
		<p>-Infinity</p>
		<p>-Infinity</p>
		<p>-Infinity</p>
		<p>Infinity</p>
		<p>Infinity</p>
		<p>NaN</p>
		<p id="mixed">-Infinity</p>
		<p id="same">-Infinity</p>
		<button>toggle</button>
	`,
	test({ assert, target }) {
		const button = target.querySelector('button');
		ok(button);
		flushSync(() => button.click());
		assert.equal(target.querySelector('#mixed')?.textContent, 'Infinity');
		assert.equal(target.querySelector('#same')?.textContent, '-Infinity');
	}
});
