export default {
	get props() {
		return {
			cats: [
				{ name: 'cat 0', checked: false },
				{ name: 'cat 1', checked: false }
			]
		};
	},

	html: `
		<input type="checkbox">
		<input type="checkbox">
	`,

	test({ assert, component, target, window }) {
		const { cats } = component;
		const new_cats = cats.slice();
		new_cats.push({
			name: 'cat ' + cats.length,
			checked: false
		});
		component.cats = new_cats;

		let inputs = target.querySelectorAll('input');
		assert.equal(inputs.length, 3);

		const event = new window.Event('change');
		inputs[0].checked = true;
		inputs[0].dispatchEvent(event);

		inputs = target.querySelectorAll('input');
		assert.equal(inputs.length, 3);
	}
};
