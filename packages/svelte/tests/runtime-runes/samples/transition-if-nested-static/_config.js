import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Toggle</button>
			<div>Should not transition out</div>
		`
		);

		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, '<button>Toggle</button>');
	}
});
