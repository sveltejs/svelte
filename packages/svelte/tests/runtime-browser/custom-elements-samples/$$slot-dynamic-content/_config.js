import { test } from '../../assert';
import { mount } from 'svelte';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target, componentCtor: Component }) {
		const component = mount(Component, { target, props: { name: 'slot' } });
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
