export default {
	data: {
		foo: {
			bar: ['x', 'y', 'z']
		}
	},

	html: `
		<input>
		<input>
		<input>
	`,

	ssrHtml: `
		<input value=x>
		<input value=y>
		<input value=z>
	`,

	test(assert, component, target, window) {
		const inputs = target.querySelectorAll('input');

		inputs[1].value = 'w';
		inputs[1].dispatchEvent(new window.MouseEvent('input'));

		assert.deepEqual(component.get(), {
			foo: {
				bar: ['x', 'w', 'z']
			}
		});
	}
};
