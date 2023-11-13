import { ok, test } from '../../test';

export default test({
	html: `
		<button>+1</button>
		<p>count: 10</p>
	`,

	async test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click', { bubbles: true });
		const button = target.querySelector('button');
		ok(button);

		await button.dispatchEvent(click);

		assert.equal(component.x, 11);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>count: 11</p>
		`
		);

		await button.dispatchEvent(click);

		assert.equal(component.x, 12);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>count: 12</p>
		`
		);
	}
});
