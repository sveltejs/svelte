export default {
	skip_if_ssr: true,

	props: {
		indeterminate: true
	},

	html: `
		<input type="checkbox">
		<p>checked? false</p>
		<p>indeterminate? true</p>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.equal(input.checked, false);
		assert.equal(input.indeterminate, true);

		const event = new window.Event('change');

		input.checked = true;
		input.indeterminate = false;
		await input.dispatchEvent(event);

		assert.equal(component.indeterminate, false);
		assert.equal(component.checked, true);
		assert.htmlEqual(target.innerHTML, `
			<input type="checkbox">
			<p>checked? true</p>
			<p>indeterminate? false</p>
		`);

		component.indeterminate = true;
		assert.equal(input.indeterminate, true);
		assert.equal(input.checked, true);
		assert.htmlEqual(target.innerHTML, `
			<input type="checkbox">
			<p>checked? true</p>
			<p>indeterminate? true</p>
		`);
	}
};
