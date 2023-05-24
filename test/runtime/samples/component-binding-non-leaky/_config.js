export default {
	html: `
		<button>0</button>
		<p>count: undefined</p>
	`,

	async test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click');
		const button = target.querySelector('button');

		await button.dispatchEvent(click);

		assert.equal(component.x, undefined);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>1</button>
			<p>count: undefined</p>
		`
		);

		await button.dispatchEvent(click);

		assert.equal(component.x, undefined);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>2</button>
			<p>count: undefined</p>
		`
		);
	}
};
