import { ok, test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	html: `
		<input type="checkbox">
		<input type="checkbox">
		<input type="checkbox">
		0
	`,

	async test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		input.checked = true;
		await input.dispatchEvent(new window.Event('change', { bubbles: true }));

		assert.htmlEqual(
			target.innerHTML,
			`
			<input type="checkbox">
			<input type="checkbox">
			<input type="checkbox">
			1
		`
		);
	}
});
