import { ok, test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {string | null} */
			name: null
		};
	},

	html: `
		<editor contenteditable="true"><b>world</b></editor>
		<p>hello world</p>
	`,

	ssrHtml: `
		<editor contenteditable="true"><b>world</b></editor>
		<p>hello</p>
	`,

	async test({ assert, component, target, window }) {
		assert.equal(component.name, 'world');

		const el = target.querySelector('editor');
		ok(el);

		const event = new window.Event('input');

		el.textContent = 'everybody';
		await el.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<editor contenteditable="true">everybody</editor>
			<p>hello everybody</p>
		`
		);

		component.name = 'goodbye';
		assert.equal(el.textContent, 'goodbye');
		assert.htmlEqual(
			target.innerHTML,
			`
			<editor contenteditable="true">goodbye</editor>
			<p>hello goodbye</p>
		`
		);
	}
});
