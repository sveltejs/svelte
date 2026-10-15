import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { dev: true },
	async test({ assert, target }) {
		const host = /** @type {HTMLElement} */ (target.querySelector('spread-host'));
		assert.htmlEqual(host.innerHTML, '<p>child</p>');
		const child = host.querySelector('p');
		target.querySelector('button')?.click();
		await tick();
		assert.equal(host.querySelector('p'), child);
		assert.htmlEqual(host.innerHTML, '<p>child</p>');
	}
});
