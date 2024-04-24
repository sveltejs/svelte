import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	warnings: [
		{
			code: 'avoid_is',
			message: 'The "is" attribute is not supported cross-browser and should be avoided',
			start: {
				character: 109,
				column: 8,
				line: 7
			},
			end: {
				character: 127,
				column: 26,
				line: 7
			}
		}
	],
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		await tick();
		assert.equal(target.innerHTML, '<custom-element></custom-element>');

		/** @type {any} */
		const el = target.querySelector('custom-element');
		const button = el.shadowRoot.querySelector('button');

		const ctor = customElements.get('custom-button');
		assert.ok(ctor && button instanceof ctor);
	}
});
