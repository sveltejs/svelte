// $$props reactivity in slot fallback
export default {
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
		input.value = 'abc';
		await input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(target.innerHTML, `
			<input>
			{"value":"abc"}
		`);
	}
};
