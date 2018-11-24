export default {
	props: {
		value: 'some text',
	},

	html: `
		<textarea></textarea>
		<p>some text</p>
	`,

	ssrHtml: `
		<textarea value="some text"></textarea>
		<p>some text</p>
	`,

	async test({ assert, component, target, window }) {
		const textarea = target.querySelector('textarea');
		assert.equal(textarea.value, 'some text');

		const event = new window.Event('input');

		textarea.value = 'hello';
		await textarea.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<textarea></textarea>
			<p>hello</p>
		`);

		component.value = 'goodbye';
		assert.equal(textarea.value, 'goodbye');
		assert.htmlEqual(target.innerHTML, `
			<textarea></textarea>
			<p>goodbye</p>
		`);
	},
};
