import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const [fill, clear] = target.querySelectorAll('button');
		const outputs = target.querySelectorAll('output');

		/** @param {boolean} filled */
		function check(filled) {
			const content = filled ? '<span>a</span><span>b</span>' : '';
			for (const [i, output] of outputs.entries()) {
				assert.htmlEqual(output.innerHTML, i === 1 ? `before ${content} after` : content);
			}
			assert.equal(window.document.body.dataset.emptyFallback, filled ? undefined : 'mounted');
		}

		check(false);
		for (let i = 0; i < 2; i++) {
			fill.click();
			await tick();
			check(true);
			clear.click();
			await tick();
			check(false);
		}
	}
});
