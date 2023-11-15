import { test } from '../../test';

export default test({
	html: `
		<div>
			<p>a</p>
		</div>
	`,

	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		const click = new window.MouseEvent('click', { bubbles: true });

		await div?.dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<p>b</p>
			</div>
		`
		);
	}
});
