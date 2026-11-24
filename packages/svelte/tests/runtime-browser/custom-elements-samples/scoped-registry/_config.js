import { test } from '../../assert';
const tick = () => new Promise((resolve) => setTimeout(resolve));

export default test({
	async test({ assert, target, componentCtor, window }) {
		/** @type {any} */
		const { scoped_registry: registry, ScopedProp, GlobalProp } = window;

		// the recipe: no `tag`, so the consumer decides where to define the element
		customElements.define('outer-element', componentCtor.element);
		assert.equal(customElements.get('inner-element'), undefined);

		// render the globally defined `x-prop` first, so that its setters are cached
		target.innerHTML = '<global-widget></global-widget><outer-element></outer-element>';
		await tick();
		await tick();

		/** @type {any} */
		const global_prop = target.querySelector('global-widget')?.shadowRoot?.querySelector('x-prop');
		assert.ok(global_prop instanceof GlobalProp);
		assert.equal(global_prop.getAttribute('value'), 'global');

		/** @type {any} */
		const root = target.querySelector('outer-element')?.shadowRoot;
		assert.equal(root.customElementRegistry, registry);

		// elements from the markup are upgraded using the scoped registry, and their properties are set
		// (rather than attributes) even though the same tag name means something else globally
		const x_prop = root.querySelector('x-prop.static');
		assert.ok(x_prop instanceof ScopedProp);
		assert.equal(x_prop.textContent, 'scoped: hello');
		assert.equal(x_prop.hasAttribute('value'), false);

		// <svelte:element> and {@html} also use the scoped registry
		assert.ok(root.querySelector('x-prop.dynamic') instanceof ScopedProp);
		assert.ok(root.querySelector('x-prop.html') instanceof ScopedProp);

		// Svelte custom elements defined in the scoped registry work, and props are passed as properties
		// (a number stays a number) rather than as attributes
		/** @type {any} */
		const inner = root.querySelector('inner-element');
		assert.ok(inner instanceof registry.get('inner-element'));
		const p = inner.shadowRoot.querySelector('p');
		assert.equal(p.textContent, 'number: 1');

		root.querySelector('button').click();
		await tick();
		assert.equal(x_prop.textContent, 'scoped: world');
		assert.equal(p.textContent, 'number: 2');
	}
});
