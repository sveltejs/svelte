import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [add, adjust] = target.querySelectorAll('button');

		add.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>add</button> <button>adjust</button>
			<h2>Keyed</h2>
			<div>Item: 1. Index: 0</div>
			<div>Item: 0. Index: 1</div>
			<h2>Unkeyed</h2>
			<div>Item: 1. Index: 0</div>
			<div>Item: 0. Index: 1</div>`
		);

		add.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>add</button> <button>adjust</button>
			<h2>Keyed</h2>
			<div>Item: 2. Index: 0</div>
			<div>Item: 1. Index: 1</div>
			<div>Item: 0. Index: 2</div>
			<h2>Unkeyed</h2>
			<div>Item: 2. Index: 0</div>
			<div>Item: 1. Index: 1</div>
			<div>Item: 0. Index: 2</div>`
		);

		adjust.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>add</button> <button>adjust</button>
			<h2>Keyed</h2>
			<div>Item: 2. Index: 0</div>
			<div>Item: 1. Index: 1</div>
			<div>Item: 10. Index: 2</div>
			<h2>Unkeyed</h2>
			<div>Item: 2. Index: 0</div>
			<div>Item: 1. Index: 1</div>
			<div>Item: 10. Index: 2</div>`
		);
	}
});
