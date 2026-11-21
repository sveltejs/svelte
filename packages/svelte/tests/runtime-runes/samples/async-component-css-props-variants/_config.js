import { tick, settled } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: { dev: true },

	async test({ assert, target }) {
		await tick();
		await settled();

		const [output] = target.querySelectorAll('output');
		const wrappers = output.querySelectorAll('svelte-css-wrapper, g');
		const widths = () => [...wrappers].map((wrapper) => wrapper.getAttribute('style'));
		assert.deepEqual(widths(), [
			'display: contents; --width: 10rem;',
			'display: contents; --width: 10rem;',
			'--width: 10rem;',
			'display: contents; --width: 10rem;'
		]);

		const [g] = output.querySelectorAll('g');
		assert.equal(g.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.htmlEqual(g.innerHTML, '<circle r="5"></circle>');
		// @ts-expect-error
		assert.deepEqual(g.__svelte_meta.loc, { file: 'main.svelte', line: 20, column: 12 });

		const [resize, hide] = target.querySelectorAll('button');
		resize.click();
		await settled();
		assert.htmlEqual(wrappers[0].innerHTML, '<p>20rem</p>');
		assert.deepEqual(widths(), [
			'display: contents; --width: 10rem;',
			'display: contents; --width: 20rem;',
			'--width: 20rem;',
			'display: contents; --width: 20rem;'
		]);

		hide.click();
		await settled();
		assert.htmlEqual(output.innerHTML, '<span>before</span><span>after</span>');
	}
});
