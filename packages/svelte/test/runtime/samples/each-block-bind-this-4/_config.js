export default {
	html: `
		<button>Flip</button><p>1</p><p>2</p>
	`,

	async test({ assert, window, component, target }) {
		const pArray1 = target.querySelectorAll('p');
		assert.equal(component.bindings['hello'], pArray1[0]);
		assert.equal(component.bindings['goodbye'], pArray1[1]);

		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');
		await button.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, '<button>Flip</button><p>-1</p><p>-2</p>');

		const pArray2 = target.querySelectorAll('p');
		assert.equal(component.bindings['olleh'], pArray2[0]);
		assert.equal(component.bindings['eybdoog'], pArray2[1]);
		assert.equal(component.bindings['hello'], null);
		assert.equal(component.bindings['goodbye'], null);
	}
};
