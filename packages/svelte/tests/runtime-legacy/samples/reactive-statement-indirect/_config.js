import { test } from '../../test';

export default test({
	html: `
		<h1>2</h1>
		<button>Increment</button>
	`,
	async test({ assert, target }) {
		await target
			.querySelector('button')
			?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>4</h1>
			<button>Increment</button>
		`
		);
	}
});
