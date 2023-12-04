import { test } from '../../test';

export default test({
	html: `
		<p>internal: 1</p>
		<button>click me</button>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button?.dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>internal: 1</p>
			<button>click me</button>
		`
		);
	}
});
