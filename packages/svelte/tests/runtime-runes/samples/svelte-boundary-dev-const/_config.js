import { flushSync } from 'svelte';
import { test } from '../../test';

// https://github.com/sveltejs/svelte/issues/15368
export default test({
	compileOptions: {
		dev: true
	},

	mode: ['client'],

	html: `
		<p>BOOM</p>
		<p>BOOM</p>
		<div>OK</div>
		<div>OK</div>
	`,

	async test({ target, assert, component }) {
		component.ok = false;
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
		<p>BOOM</p>
		<p>BOOM</p>
		<p>BOOM</p>
		<p>BOOM</p>
		`
		);
	}
});
