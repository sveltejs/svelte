import { test } from '../../test';

export default test({
	// TODO: This passes but unclear what the test is actually testing
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
			<button>4</button>
		`
		);
	}
});
