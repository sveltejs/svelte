export default {
	html: `
		<button>+1</button>
		<p>0</p>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.equal(component.counter, 1);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>1</p>
		`
		);

		await button.dispatchEvent(event);
		assert.equal(component.counter, 2);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>+1</button>
			<p>2</p>
		`
		);

		assert.equal(component.foo(), 42);
	}
};
