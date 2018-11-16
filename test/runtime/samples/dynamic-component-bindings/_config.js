export default {
	props: {
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

		assert.equal(component.y, 'abc');

		component.x = false;

		assert.htmlEqual(target.innerHTML, `
			<p>bar</p>
			<input type='checkbox'>
		`);

		input = target.querySelector('input');
		input.checked = true;
		input.dispatchEvent(new window.Event('change'));

		assert.equal(component.z, true);
	}
};