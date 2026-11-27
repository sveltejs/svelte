import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>increment</button><p>0</p><p>0</p>',
	async test({ assert, target }) {
		target.querySelector('button')?.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>1</p><p>1</p>');
	}
});
