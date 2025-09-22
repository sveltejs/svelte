import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>hello from server</p>
				<p>hello from server</p>
				<p>hello from server</p>
				<p>hello from server</p>
			`
		);

		const [button1, button2] = target.querySelectorAll('button');

		button1.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>hello from browser</p>
				<p>hello from browser</p>
				<p>hello from server</p>
				<p>hello from server</p>
			`
		);

		button2.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>hello from browser</p>
				<p>hello from browser</p>
				<p>hello from browser</p>
				<p>hello from browser</p>
			`
		);
	}
});
