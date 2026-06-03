import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `
		<h1>hello</h1>
		<svelte-css-wrapper style="display: contents; --color: red;">
			<h2 class="svelte-13kae5a">hello from component</h2>
		</svelte-css-wrapper>
		<p>goodbye</p>
	`,

	async test({ target, assert }) {
		const h1 = target.querySelector('h1');
		const h2 = target.querySelector('h2');
		const p = target.querySelector('p');

		// @ts-expect-error
		assert.deepEqual(h1.__svelte_meta.loc, {
			file: 'main.svelte',
			line: 5,
			column: 0
		});

		// @ts-expect-error
		assert.deepEqual(h2.__svelte_meta.loc, {
			file: 'Component.svelte',
			line: 1,
			column: 0
		});

		// @ts-expect-error
		assert.deepEqual(p.__svelte_meta.loc, {
			file: 'main.svelte',
			line: 7,
			column: 0
		});
	}
});
