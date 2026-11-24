import { tick } from 'svelte';
import { test } from '../../test';
import { raf } from '../../../animation-helpers';

export default test({
	async test({ assert, target }) {
		target.querySelector('button')?.click();
		await tick();
		raf.tick(110);
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>hide</button><output>1</output>');
	}
});
