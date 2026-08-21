import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],

	server_props: {
		browser: false
	},

	ssrHtml: `
		<h1>hello from the server</h1>
		<h2>hello from the server</h2>
		<h3>hello from the server</h3>
	`,

	props: {
		browser: true
	},

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<h1>hello from the browser</h1>
				<h2>hello from the browser</h2>
				<h3>hello from the browser</h3>
			`
		);
	}
});
