export default {
	html: `
		<p>value(1) = 1</p>
		<button>Toggle Component</button>
	`,

	async test({ assert, component, window, target }) {
		const button = target.querySelector('button');
		await button.dispatchEvent(new window.Event('click'));
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>value(2) = 2</p>
				<button>Toggle Component</button>
			`
		);
		assert.equal(component.n, 2);
		await button.dispatchEvent(new window.Event('click'));
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>value(1) = 3</p>
				<button>Toggle Component</button>
			`
		);
		assert.equal(component.n, 3);
	}
};
