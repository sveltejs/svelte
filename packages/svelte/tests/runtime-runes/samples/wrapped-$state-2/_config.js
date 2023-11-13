import { test } from '../../test';

export default test({
	html: `
  <button>foo</button>
`,

	async test({ assert, target, window }) {
		const clickEvent = new window.Event('click', { bubbles: true });
		await target.querySelector('button')?.dispatchEvent(clickEvent);
		assert.htmlEqual(
			target.innerHTML,
			`
      <button>bar</button>
    `
		);
	}
});
