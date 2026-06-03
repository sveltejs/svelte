import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>hello</button><p>pending</p>`,

	async test({ assert, target }) {
		const [hello] = target.querySelectorAll('button');

		hello.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>hello</button><p>hello</p>');
	}
});
