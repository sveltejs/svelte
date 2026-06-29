import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		button.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>show</button><p>error was contained</p>');
	}
});
