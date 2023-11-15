import { ok, test } from '../../test';

export default test({
	html: `
		<button>Switch</button>
		<p>Another first line</p>
		<p>This line should be last.</p>
	`,
	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		ok(btn);

		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		await btn.dispatchEvent(clickEvent);
		await Promise.resolve(); // additional tick to rerender

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Switch</button>
				<p>First line</p>
				<p>This line should be last.</p>
			`
		);

		await btn.dispatchEvent(clickEvent);
		await Promise.resolve(); // additional tick to rerender

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Switch</button>
				<p>Another first line</p>
				<p>This line should be last.</p>
			`
		);
	}
});
