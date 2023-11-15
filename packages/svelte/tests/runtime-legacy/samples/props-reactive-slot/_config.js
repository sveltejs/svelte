import { test } from '../../test';

export default test({
	html: `
		<h1>hi</h1>
		<button>Change</button>
	`,

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		await btn?.dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>changed</h1>
			<button>Change</button>
		`
		);
	}
});
