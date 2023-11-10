import { ok, test } from '../../test';

// $$props reactivity in slot fallback
export default test({
	html: `
		<input>
		{"value":""}
	`,
	ssrHtml: `
		<input value="">
		{"value":""}
	`,

	async test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		input.value = 'abc';
		await input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			{"value":"abc"}
		`
		);
	}
});
