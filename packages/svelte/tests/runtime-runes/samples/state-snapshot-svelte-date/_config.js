import { test } from '../../test';
import { tick } from 'svelte';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, '<button>update</button><p>1970-01-01T00:00:00.000Z</p>');

		target.querySelector('button')?.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>update</button><p>1970-01-02T00:00:00.000Z</p>');
	}
});
