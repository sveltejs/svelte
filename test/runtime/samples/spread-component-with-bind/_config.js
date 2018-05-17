export default {
	html: `
		<p>foo</p>
		<input>
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
