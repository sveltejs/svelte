import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		target.querySelector('button')?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>run</button><p>child</p><span></span>');
	}
});
