export default {
	html: `
    Hello
    <input />
	`,
	ssrHtml: `
		Hello
		<input value="Hello"/>
	`,
	async test({ assert, target, window }) {
		const input = target.querySelector('input');
		input.value = 'abcd';
		await input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(
			target.innerHTML,
			`
        abcd
        <input />
      `
		);
	}
};
