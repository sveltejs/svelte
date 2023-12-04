import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	skip: true, // TODO: decide if we want to keep the customElement={null} behavior (warning about not having set the tag when in ce mode, and disabling that this way)

	async test({ assert, target, component: Component }) {
		const component = new Component({ target, props: { name: 'slot' } });
		await tick();
		await tick();

		/** @type {any} */
		const ce = target.querySelector('my-widget');

		assert.htmlEqual(
			ce.shadowRoot.innerHTML,
			`
		<slot></slot>
		<p>named fallback</p>
	`
		);

		component.name = 'slot2';
		assert.htmlEqual(
			ce.shadowRoot.innerHTML,
			`
		<slot></slot>
		<p>named fallback</p>
	`
		);
	}
});
