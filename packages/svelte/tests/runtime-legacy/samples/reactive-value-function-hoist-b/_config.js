import { test } from '../../test';

export default test({
	html: `
		<button>Click me</button>
	`,

	async test({ assert, target, window }) {
		const event = new window.MouseEvent('click', { bubbles: true });
		const button = target.querySelector('button');

		await button?.dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>A,B,C</button>
		`
		);
	}
});
