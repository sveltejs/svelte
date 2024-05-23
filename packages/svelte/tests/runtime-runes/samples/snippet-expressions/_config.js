import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<p>foo</p>
		<hr>
		<p>foo</p>
		<hr>
		<p>foo</p>
		<hr>
		<p>foo</p>
		<hr>
		<p>foo</p>
		<hr>
		<p>foo</p>
		<hr>
		<p>bar</p>
		<hr>
		<hr>
		<button>toggle</button>
	`,

	test({ assert, target }) {
		const btn = target.querySelector('button');
		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>bar</p>
				<hr>
				<p>bar</p>
				<hr>
				<p>foo</p>
				<hr>
				<p>foo</p>
				<hr>
				<p>foo</p>
				<hr>
				<p>foo</p>
				<hr>
				<p>foo</p>
				<hr>
				<p>foo</p>
				<hr>
				<p>foo</p>
				<button>toggle</button>
			`
		);
	}
});
