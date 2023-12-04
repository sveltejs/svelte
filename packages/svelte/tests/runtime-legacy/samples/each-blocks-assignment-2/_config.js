import { test } from '../../test';

export default test({
	html: `
		<span class="content">foo</span>
		<button>Test</button>
	`,
	async test({ assert, target, window }) {
		const button = target.querySelector('button');

		const clickEvent = new window.MouseEvent('click', { bubbles: true });
		await button?.dispatchEvent(clickEvent);
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<span class="content">bar</span>
			<button>Test</button>
		`
		);
	}
});
