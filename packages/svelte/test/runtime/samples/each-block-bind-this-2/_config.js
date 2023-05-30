export default {
	html: `
		<button>Flip</button><p>1</p>
	`,

	async test({ assert, window, component, target }) {
		const p1 = target.querySelector('p');
		assert.equal(component.bindings[1], p1);

		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, '<button>Flip</button><p>2</p>');

		const p2 = target.querySelector('p');
		assert.equal(component.bindings[2], p2);
	}
};
