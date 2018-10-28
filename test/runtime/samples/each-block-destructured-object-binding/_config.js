export default {
	data: {
		people: [{ name: { first: 'Doctor', last: 'Who' } }],
	},

	html: `
		<input>
		<input>
		<p>Doctor Who</p>
	`,

	ssrHtml: `
		<input value=Doctor>
		<input value=Who>
		<p>Doctor Who</p>
	`,

	test(assert, component, target, window) {
		const inputs = target.querySelectorAll('input');

		inputs[1].value = 'Oz';
		inputs[1].dispatchEvent(new window.Event('input'));

		const { people } = component.get();

		assert.deepEqual(people, [
			{ name: { first: 'Doctor', last: 'Oz' } }
		]);

		assert.htmlEqual(target.innerHTML, `
			<input>
			<input>
			<p>Doctor Oz</p>
		`);

		people[0].name.first = 'Frank';
		component.set({ people });

		assert.htmlEqual(target.innerHTML, `
			<input>
			<input>
			<p>Frank Oz</p>
		`);
	},
};
