export default {
	data: {
		name: 'world',
	},

	html: `
		<input>
		<p>hello world</p>
	`,

	test(assert, component, target, window) {
		const input = target.querySelector('input');
		assert.equal(input.value, 'world');

		const event = new window.Event('input');

		input.value = 'everybody';
		input.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>hello everybody</p>
		`);

		component.set({ name: 'goodbye' });
		assert.equal(input.value, 'goodbye');
		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>hello goodbye</p>
		`);
	},
};
