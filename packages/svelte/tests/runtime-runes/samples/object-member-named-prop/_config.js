import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>1</button><p>ready set</p><p>1 given</p><i>none</i><i>1</i>`,
	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		button.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>2</button><p>ready set</p><p>2 given</p><i>none</i><i>2</i>`
		);
	}
});
