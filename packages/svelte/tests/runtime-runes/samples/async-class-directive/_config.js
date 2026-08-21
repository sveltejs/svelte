import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `loading`,

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div class="one">one</div>
				<div class="two">two</div>
				<div style="color: red;">red</div>
				<div style="color: blue;">blue</div>
			`
		);
	}
});
