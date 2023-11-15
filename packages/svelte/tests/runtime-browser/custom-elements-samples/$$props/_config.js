import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element name="world" answer="42" test="svelte"></custom-element>';
		await tick();
		/** @type {any} */
		const el = target.querySelector('custom-element');

		assert.htmlEqual(
			el.shadowRoot.innerHTML,
			`
		<p>name: world</p>
		<p>$$props: {"name":"world","answer":"42","test":"svelte"}</p>
		<p>$$restProps: {"answer":"42","test":"svelte"}</p>
	`
		);
	}
});
