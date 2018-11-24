export default {
	props: {
		foo: true
	},

	html: `
		<input type="checkbox">
		<p>true</p>
	`,

	ssrHtml: `
		<input type="checkbox" checked>
		<p>true</p>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.equal(input.checked, true);

		const event = new window.Event('change');

		input.checked = false;
		await input.dispatchEvent(event);

		assert.equal(target.innerHTML, `<input type="checkbox">\n<p>false</p>`);

		component.foo = true;
		assert.equal(input.checked, true);
		assert.equal(target.innerHTML, `<input type="checkbox">\n<p>true</p>`);
	}
};
