import { tick } from 'svelte';
import { test } from '../../test';

// An effect must run in the batch that scheduled it, not in another batch that happens to be flushed first
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [button] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>block: 0</p><span>0</span>');

		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>block: 1</p><span>1</span>');
	}
});
