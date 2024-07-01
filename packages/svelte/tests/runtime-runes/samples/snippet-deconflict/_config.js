import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		btn?.click();
		btn?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>push</button><div style="display: grid; grid-template-columns: 1fr 1fr"><div><p style="color: red">1</p><p style="color: red">2</p><p style="color: red">3</p>
				<p style="color: red">4</p><p style="color: red">5</p><p style="color: red">6</p></div><div><p style="color: blue">1</p><p style="color: blue">2</p><p style="color: blue">3</p>
				<p style="color: blue">4</p><p style="color: blue">5</p><p style="color: blue">6</p></div></div>
			`
		);
	}
});
