import { ok, test } from '../../test';

export default test({
	html: `
	<button>Click Me</button>
	0
	<ul></ul>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const event = new window.MouseEvent('click', { bubbles: true });
		await button.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Click Me</button>
			1
			<ul></ul>
		`
		);
	}
});
