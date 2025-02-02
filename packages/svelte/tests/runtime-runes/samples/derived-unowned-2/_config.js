import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'server'],

	html: '<div>d2: 3</div><div>d3: 3</div><div>d4: 3</div>',

	async test({ assert, target }) {
		await Promise.resolve();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'<div>d2: 3,4,5</div><div>d3: 3,4,5</div><div>d4: 3,4,5</div>'
		);
	}
});
