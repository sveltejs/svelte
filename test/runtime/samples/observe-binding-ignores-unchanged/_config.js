export default {
	html: `
		<input type='number'>
		<p>field1: 1</p>
		<p>field2: 2</p>
	`,

	test(assert, component, target, window) {
		let triggered = false;
		component.refs.nested.on('state', ({ changed }) => {
			if (changed.field2) triggered = true;
		});

		const input = target.querySelector('input');
		const event = new window.Event('input');

		input.value = 3;
		input.dispatchEvent(event); // will throw error if observer fires incorrectly

		assert.ok(!triggered);

		assert.htmlEqual(target.innerHTML, `
			<input type='number'>
			<p>field1: 3</p>
			<p>field2: 2</p>
		`);
	}
};