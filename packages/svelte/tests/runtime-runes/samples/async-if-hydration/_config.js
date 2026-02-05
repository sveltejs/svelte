import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<main>
				<div>
					<h1>Title</h1>
					<div>
						<button>Button</button>
					</div>
				</div>
			</main>
		`
		);
	}
});
