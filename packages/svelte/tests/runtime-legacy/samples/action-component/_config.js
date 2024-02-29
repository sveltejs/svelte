import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	accessors: false,
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, '<button>foo / foo</button><div></div>');

		const button = target.querySelector('button');
		button?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>bar / bar</button><div></div>');
	}
});
