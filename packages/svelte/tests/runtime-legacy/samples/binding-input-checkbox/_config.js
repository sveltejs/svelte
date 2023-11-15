import { ok, test } from '../../test';

export default test({
	get props() {
		return { foo: true };
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
		ok(input);

		assert.equal(input.checked, true);

		const event = new window.Event('change');

		input.checked = false;
		await input.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<input type="checkbox">
			<p>false</p>
		`
		);

		component.foo = true;
		assert.equal(input.checked, true);
		assert.htmlEqual(
			target.innerHTML,
			`
			<input type="checkbox">
			<p>true</p>
		`
		);
	}
});
