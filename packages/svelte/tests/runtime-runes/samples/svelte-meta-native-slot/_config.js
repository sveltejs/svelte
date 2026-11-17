import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true,
		customElement: true,
		runes: false
	},

	async test({ target, assert, mod }) {
		customElements.define('svelte-meta-native-slot', mod.default.element);
		const host = document.createElement('svelte-meta-native-slot');
		target.append(host);
		try {
			await tick();

			const shadow_root = host.shadowRoot;
			ok(shadow_root);
			const [output] = shadow_root.querySelectorAll('output');
			assert.htmlEqual(
				output.innerHTML,
				`
					<slot><span>default fallback</span></slot>
					<p>after default slot</p>
					<slot name="named"><em>named fallback</em></slot>
					<strong>after named slot</strong>
				`
			);

			const slots = output.querySelectorAll('slot');
			assert.equal(slots.length, 2);
			const component = /** @type {any} */ (output).__svelte_meta.component;
			assert.ok(component);
			for (const slot of slots) {
				assert.equal(/** @type {any} */ (slot).__svelte_meta.component, component);
			}
			assert.equal(slots[0].name, '');
			assert.equal(slots[1].name, 'named');

			/** @type {Array<[string, number, number]>} */
			const expected = [
				['output', 3, 0],
				['slot:not([name])', 4, 1],
				['span', 4, 7],
				['p', 5, 1],
				['slot[name="named"]', 6, 1],
				['em', 6, 20],
				['strong', 7, 1]
			];

			for (const [selector, line, column] of expected) {
				const [element] = shadow_root.querySelectorAll(selector);

				// Native slots must not consume the locations of their following siblings.
				// @ts-expect-error
				assert.deepInclude(element.__svelte_meta, {
					loc: { file: 'main.svelte', line, column },
					parent: null
				});
			}
		} finally {
			host.remove();
			await tick();
		}
	}
});
