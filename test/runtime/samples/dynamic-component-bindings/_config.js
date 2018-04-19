export default {
	data: {
		x: true
	},

	html: `
		<p>foo</p>
		<input>
	`,

	test(assert, component, target, window) {
		let input = target.querySelector('input');
		input.value = 'abc';
		input.dispatchEvent(new window.Event('input'));

		assert.equal(component.get().y, 'abc');

		component.set({
			x: false
		});

		assert.htmlEqual(target.innerHTML, `
			<p>bar</p>
			<input type='checkbox'>
		`);

		input = target.querySelector('input');
		input.checked = true;
		input.dispatchEvent(new window.Event('change'));

		assert.equal(component.get().z, true);
	}
};