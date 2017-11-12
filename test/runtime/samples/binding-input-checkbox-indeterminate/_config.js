export default {
	data: {
		indeterminate: true,
	},

	html: `
		<input type="checkbox">
		<p>checked? false</p>
		<p>indeterminate? true</p>
	`,

	test(assert, component, target, window) {
		const input = target.querySelector('input');
		assert.equal(input.checked, true);

		const event = new window.Event('change');

		input.checked = true;
		input.dispatchEvent(event);

		assert.equal(component.get('indeterminate'), false);
		assert.equal(component.get('checked'), true);
		assert.equal(target.innerHTML, `
			<input type="checkbox">
			<p>checked? true</p>
			<p>indeterminate? false</p>
		`);

		component.set({ indeterminate: true });
		assert.equal(input.indeterminate, true);
		assert.equal(input.checked, false);
		assert.equal(target.innerHTML, `
			<input type="checkbox">
			<p>checked? false</p>
			<p>indeterminate? true</p>
		`);

		// TODO what is the behaviour when setting both `checked`
		// and `indeterminate` to conflicting values simultaneously?
	},
};
