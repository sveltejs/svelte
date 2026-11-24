import { flushSync, mount } from 'svelte';
import { test } from '../../assert';

export default test({
	async test({ assert, target, componentCtor, window }) {
		/** @type {any} */
		const { scoped_registry: registry, Leaf } = window;

		// `extend` can be used to define the element in a scoped registry from within the component
		assert.equal(registry.get('extended-element'), componentCtor.element);
		assert.equal(customElements.get('extended-element'), undefined);

		// mounting into a target that is associated with a scoped registry...
		const host = document.createElement('div');
		target.append(host);
		const shadow = host.attachShadow({ mode: 'open', customElementRegistry: registry });
		mount(componentCtor, { target: shadow });

		assert.ok(shadow.querySelector('x-leaf.static') instanceof Leaf);

		// ...also applies to elements that are created later
		flushSync(() => shadow.querySelector('button')?.click());
		assert.ok(shadow.querySelector('x-leaf.conditional') instanceof Leaf);

		// mounting into a target that uses the global registry doesn't
		const global_target = document.createElement('div');
		target.append(global_target);
		mount(componentCtor, { target: global_target });

		const leaf = global_target.querySelector('x-leaf.static');
		assert.ok(leaf !== null && !(leaf instanceof Leaf));
	}
});
