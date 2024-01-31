import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>mutate</button>
		<div>
			<span>hello</span>
		</div>
	`,

	async test({ assert, target }) {
		target.querySelector('button')?.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>mutate</button>
				<div>
					<span>bye</span>
				</div>
			`
		);
	}
});
