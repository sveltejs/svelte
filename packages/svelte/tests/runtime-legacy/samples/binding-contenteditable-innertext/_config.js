import { ok, test } from '../../test';

export default test({
	get props() {
		return { name: 'world' };
	},

	ssrHtml: `
		<editor contenteditable="true">world</editor>
		<p>hello world</p>
	`,

	async test({ assert, component, target, window }) {
		// JSDom doesn't support innerText yet, so the test is not ideal
		// https://github.com/jsdom/jsdom/issues/1245
		const el = target.querySelector('editor');
		ok(el);

		// @ts-expect-error
		assert.equal(el.innerText, 'world');

		const event = new window.Event('input');

		// @ts-expect-error
		el.innerText = 'everybody';
		await el.dispatchEvent(event);
		assert.equal(component.name, 'everybody');

		component.name = 'goodbye';

		// @ts-expect-error
		assert.equal(el.innerText, 'goodbye');
	}
});
