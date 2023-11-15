import { test } from '../../test';

export default test({
	html: `
		<button>Mutate a</button>
		<div>{}</div>
	`,

	async test({ assert, target }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		await button?.dispatchEvent(click);
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Mutate a</button>
			<div>{"foo":42}</div>
		`
		);
	}
});
