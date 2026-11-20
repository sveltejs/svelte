import { settled } from 'svelte';
import { test } from '../../test';

const list = ['a', 'b', 'c']
	.map(
		(name) =>
			`<div class="row"><span>${name}</span><button aria-label="Remove ${name}">x</button></div>`
	)
	.join('');

export default test({
	mode: ['client', 'hydrate', 'async-server'],
	ssrHtml: `<p>before</p><section>${list}</section><section>${list}</section><section>${list}</section><p>after</p>`,
	async test({ assert, target }) {
		await new Promise((resolve) => setTimeout(resolve, 0));
		await settled();
		assert.htmlEqual(
			target.innerHTML,
			`<p>before</p><section>${list}</section><section>${list}</section><section>${list}</section><p>after</p>`
		);

		const siblings = [...target.querySelectorAll('p')];
		const sections = target.querySelectorAll('section');
		const orders = [
			['b', 'c', 'a'],
			['c', 'a', 'b'],
			['a', 'b', 'c']
		];

		for (const [index, order] of orders.entries()) {
			const section = sections[index];
			const rows = [...section.querySelectorAll('.row')];
			let remaining = ['a', 'b', 'c'];

			for (const name of order) {
				const button = [...section.querySelectorAll('button')].find(
					(button) => button.getAttribute('aria-label') === `Remove ${name}`
				);
				if (!button) throw new Error(`Missing Remove ${name} button`);
				button.click();
				await settled();
				remaining = remaining.filter((item) => item !== name);

				assert.deepEqual(
					[...section.querySelectorAll('.row > span')].map((span) => span.textContent),
					remaining
				);
				for (const item of remaining) {
					assert.strictEqual(
						section.querySelectorAll('.row')[remaining.indexOf(item)],
						rows[['a', 'b', 'c'].indexOf(item)]
					);
				}
			}
			assert.htmlEqual(section.innerHTML, '');
		}

		assert.deepEqual([...target.querySelectorAll('p')], siblings);
		assert.htmlEqual(
			target.innerHTML,
			'<p>before</p><section></section><section></section><section></section><p>after</p>'
		);
	}
});
