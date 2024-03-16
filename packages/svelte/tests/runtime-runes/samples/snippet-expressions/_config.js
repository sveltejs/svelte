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
		<p>bar</p>
		<hr>
		<hr>
		<button>toggle</button>
	`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();
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
				<button>toggle</button>
			`
		);
	}
});
