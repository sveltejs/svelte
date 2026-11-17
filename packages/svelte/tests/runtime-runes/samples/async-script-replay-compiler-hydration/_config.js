import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	compileOptions: { experimental: { async: true, scriptReplay: true } },
	async test({ assert, target, hydrate }) {
		// Capture the server-rendered nodes before manually starting hydration.
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		const [paragraph] = output.querySelectorAll('p');
		assert.htmlEqual(output.innerHTML, '<p>2 3</p>');

		hydrate();
		await tick();
		await settled();
		assert.htmlEqual(output.innerHTML, '<p>2 3</p>');
		assert.equal(target.querySelector('button'), button);
		assert.equal(target.querySelector('output'), output);
		assert.equal(output.querySelector('p'), paragraph);

		button.click();
		await settled();
		assert.htmlEqual(output.innerHTML, '<p>3 4</p>');
		assert.equal(target.querySelector('button'), button);
		assert.equal(target.querySelector('output'), output);
		assert.equal(output.querySelector('p'), paragraph);
	}
});
