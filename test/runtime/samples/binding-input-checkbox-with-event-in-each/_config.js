export default {
	props: {
		cats: [
			{
				name: "cat 0",
				checked: false,
			},
			{
				name: "cat 1",
				checked: false,
			},
		],
	},

	html: `
		<input type="checkbox">
		<input type="checkbox">
	`,

	test({ assert, component, target, window }) {
		const { cats } = component;
		const newCats = cats.slice();
		newCats.push({
			name: "cat " + cats.length,
			checked: false,
		});
		component.cats = newCats;

		let inputs = target.querySelectorAll('input');
		assert.equal(inputs.length, 3);

		const event = new window.Event('change');
		inputs[0].checked = true;
		inputs[0].dispatchEvent(event);

		inputs = target.querySelectorAll('input');
		assert.equal(inputs.length, 3);
	}
};
