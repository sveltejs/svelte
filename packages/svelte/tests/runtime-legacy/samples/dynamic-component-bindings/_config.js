import { ok, test } from '../../test';

export default test({
	get props() {
		return { x: true };
	},

	html: `
		<p>foo</p>
		<input>
	`,

	async test({ assert, component, target, window }) {
		let input = target.querySelector('input');
		ok(input);

		input.value = 'abc';
		await input.dispatchEvent(new window.Event('input'));

		assert.equal(component.y, 'abc');

		component.x = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>bar</p>
			<input type='checkbox'>
		`
		);

		input = target.querySelector('input');
		ok(input);

		input.checked = true;
		await input.dispatchEvent(new window.Event('change'));

		assert.equal(component.z, true);
	}
});
