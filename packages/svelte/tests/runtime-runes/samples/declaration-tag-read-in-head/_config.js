import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>2</button>`,
	async test({ assert, target }) {
		assert.equal(window.document.title, '2 doubled');

		const [button] = target.querySelectorAll('button');
		button.click();
		await tick();

		assert.equal(window.document.title, '4 doubled');
		assert.htmlEqual(target.innerHTML, `<button>4</button>`);
	}
});
