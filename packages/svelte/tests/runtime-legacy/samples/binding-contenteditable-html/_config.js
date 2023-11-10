import { ok, test } from '../../test';

export default test({
	get props() {
		return { name: '<b>world</b>' };
	},

	html: `
		<editor contenteditable="true"><b>world</b></editor>
		<p>hello <b>world</b></p>
	`,

	async test({ assert, component, target, window }) {
		const el = target.querySelector('editor');
		ok(el);
		assert.equal(el.innerHTML, '<b>world</b>');

		el.innerHTML = 'every<span>body</span>';

		// No updates to data yet
		assert.htmlEqual(
			target.innerHTML,
			`
			<editor contenteditable="true">every<span>body</span></editor>
			<p>hello <b>world</b></p>
		`
		);

		// Handle user input
		const event = new window.Event('input');
		await el.dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
			<editor contenteditable="true">every<span>body</span></editor>
			<p>hello every<span>body</span></p>
		`
		);

		component.name = 'good<span>bye</span>';
		assert.equal(el.innerHTML, 'good<span>bye</span>');
		assert.htmlEqual(
			target.innerHTML,
			`
			<editor contenteditable="true">good<span>bye</span></editor>
			<p>hello good<span>bye</span></p>
		`
		);
	}
});
