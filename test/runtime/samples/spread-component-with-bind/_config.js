export default {
	html: `
		<p>foo</p>
		<input>
	`,

	ssrHtml: `
		<p>foo</p>
		<input value=foo>
	`,

	test (assert, component, target, window) {
		const input = target.querySelector('input');

		input.value = 'bar';
		input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(target.innerHTML, `
			<p>bar</p>
			<input>
		`);
	}
};
