import { ok, test } from '../../test';

export default test({
	html: `
		<button>+1</button>
		<p>count: 0</p>
	`,

	async test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click', { bubbles: true });
		const button = target.querySelector('button');
		ok(button);

		await button.dispatchEvent(click);

		assert.equal(component.x, 2);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>count: 2</p>
		`
		);

		await button.dispatchEvent(click);

		assert.equal(component.x, 6);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>count: 6</p>
		`
		);
	}
});
