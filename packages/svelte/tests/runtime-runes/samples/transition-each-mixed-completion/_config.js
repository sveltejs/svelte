import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, raf, target }) {
		const [button] = target.querySelectorAll('button');
		button.click();
		await tick();

		const containers = target.querySelectorAll('div');
		for (let i = 0; i < containers.length; i++) {
			// Only groups containing a timed outro should remain.
			assert.equal(containers[i].children.length, i % 4 === 3 || i >= 12 ? 2 : 0);
		}

		raf.tick(400);
		assert.htmlEqual(target.innerHTML, '<button>remove</button>' + '<div></div>'.repeat(16));
	}
});
