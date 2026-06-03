import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>click</button>
				<div>teardown</div>
				<div>1</div>
				<div>2</div>
				<div>3</div>
			`
		);
		const [increment] = target.querySelectorAll('button');

		increment.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>click</button>
				<div>1</div>
				<div>3</div>
			`
		);
	}
});
