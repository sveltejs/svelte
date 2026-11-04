import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [button] = target.querySelectorAll('button');
		button.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>2</button>');
		assert.deepEqual(logs, ['run', 1, 'teardown', 1, 'run', 2]);
	}
});
