import { ok, test } from '../../test';

export default test({
	html: `
	<button>Click Me</button>
	<div>Icon B</div>
	`,

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		ok(btn);

		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		await btn.dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Click Me</button>
			<div>Icon A</div>
			`
		);

		await btn.dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Click Me</button>
			<div>Icon B</div>
			`
		);
	}
});
