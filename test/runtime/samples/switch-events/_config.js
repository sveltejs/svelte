export default {
	data: {
		x: true
	},

	html: `
		<button>select foo</button>
	`,

	test(assert, component, target, window) {
		const click = new window.MouseEvent('click');

		target.querySelector('button').dispatchEvent(click);
		assert.equal(component.get('selected'), 'foo');

		component.set({
			x: false
		});

		assert.htmlEqual(target.innerHTML, `
			<button>select bar</button>
		`);

		target.querySelector('button').dispatchEvent(click);
		assert.equal(component.get('selected'), 'bar');
	}
};