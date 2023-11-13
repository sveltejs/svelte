import { test } from '../../test';

export default test({
	props: {
		x: 'x'
	},
	html: `
		<div>A wild component appears</div>
		<p>x</p>
		<input type=text>
	`,

	ssrHtml: `
		<div>A wild component appears</div>
		<p>x</p>
		<input type=text value=x>
	`,

	test({ assert, component, target }) {
		component.x = 'y';
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>A wild component appears</div>
			<p>y</p>
			<input type=text>
		`
		);
	}
});
