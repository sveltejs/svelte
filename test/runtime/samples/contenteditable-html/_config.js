export default {
	props: {
		name: '<b>world</b>',
	},

	html: `
		<editor><b>world</b></editor>
		<p>hello <b>world</b></p>
	`,

	ssrHtml: `
		<editor contenteditable="true"><b>world</b></editor>
		<p>hello <b>world</b></p>
	`,

	async test({ assert, component, target, window }) {
		const el = target.querySelector('editor');
		assert.equal(el.innerHTML, '<b>world</b>');

		el.innerHTML = 'every<span>body</span>';

		// No updates to data yet
		assert.htmlEqual(target.innerHTML, `
			<editor>every<span>body</span></editor>
			<p>hello <b>world</b></p>
		`);

		// Handle user input
		const event = new window.Event('input');
		await el.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<editor>every<span>body</span></editor>
			<p>hello every<span>body</span></p>
		`);

		component.name = 'good<span>bye</span>';
		assert.equal(el.innerHTML, 'good<span>bye</span>');
		assert.htmlEqual(target.innerHTML, `
			<editor>good<span>bye</span></editor>
			<p>hello good<span>bye</span></p>
		`);
	},
};
