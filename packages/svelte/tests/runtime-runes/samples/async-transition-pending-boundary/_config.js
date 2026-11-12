import { tick } from 'svelte';
import { test } from '../../test';
import { raf } from '../../../animation-helpers';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [hide] = target.querySelectorAll('button');

		hide.click();
		await tick();
		raf.tick(110);
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>hide</button> <p>sibling</p>');
		assert.deepEqual(logs, ['effect ran']);
	}
});
