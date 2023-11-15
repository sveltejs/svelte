import { ok, test } from '../../test';

export default test({
	html: `
		<button>0</button>
		<p>count: </p>
	`,

	async test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click', { bubbles: true });
		const button = target.querySelector('button');
		ok(button);

		await button.dispatchEvent(click);

		assert.equal(component.x, undefined);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>1</button>
			<p>count: </p>
		`
		);

		await button.dispatchEvent(click);

		assert.equal(component.x, undefined);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>2</button>
			<p>count: </p>
		`
		);
	}
});
