import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_mode: ['async-server'],

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<p class="cool">cool</p>
				<p>beans</p>

				<p class="awesome">awesome</p>
				<p>sauce</p>

				<p class="neato">neato</p>
				<p>burrito</p>
			`
		);
	}
});
