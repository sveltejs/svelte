export default {
	props: {
		count: 42
	},

	html: `
		<input type=number>
		<p>number 42</p>
	`,

	ssrHtml: `
		<input type=number value=42>
		<p>number 42</p>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.equal(input.value, '42');

		const event = new window.Event('input');

		input.value = '43';
		await input.dispatchEvent(event);

		assert.equal(component.count, 43);
		assert.htmlEqual(target.innerHTML, `
			<input type='number'>
			<p>number 43</p>
		`);

		component.count = 44;
		assert.equal(input.value, '44');
		assert.htmlEqual(target.innerHTML, `
			<input type='number'>
			<p>number 44</p>
		`);

		// empty string should be treated as null
		input.value = '';
		await input.dispatchEvent(event);

		assert.equal(component.count, null);
		assert.htmlEqual(target.innerHTML, `
			<input type='number'>
			<p>object null</p>
		`);
	}
};
