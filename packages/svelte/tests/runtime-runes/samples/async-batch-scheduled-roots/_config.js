import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, target, errors }) {
		const button = target.querySelector('button');
		button?.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>show</button> 0 <button>1</button>');
		assert.deepEqual(errors, []);
	}
});
