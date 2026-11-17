import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	compileOptions: {
		dev: true
	},
	html: `
		<p>main</p>
		<button>toggle</button>
		<p>main if</p>
		<p>child</p>
		<p>child each</p>
		<p>child</p>
		<p>child each</p>
		<p>passthrough</p>
		<p>main snippet</p>
		<p>main dynamic</p>
	`,

	test({ target, assert }) {
		/** @param {Element} element */
		const component = (element) => /** @type {any} */ (element).__svelte_meta.component;

		const check = () => {
			const [
				main,
				main_if,
				child1,
				child1_each,
				child2,
				child2_each,
				passthrough,
				snippet,
				dynamic
			] = target.querySelectorAll('p');

			assert.ok(component(main));
			// the instance that rendered the element, also inside blocks
			assert.equal(component(main_if), component(main));
			assert.equal(component(dynamic), component(main));

			// each instance of a component is its own context
			assert.ok(component(child1));
			assert.notEqual(component(child1), component(main));
			assert.notEqual(component(child1), component(child2));
			assert.equal(component(child1_each), component(child1));
			assert.equal(component(child2_each), component(child2));

			// a snippet is rendered in the component that renders it, like the `parent` stack
			assert.equal(component(snippet), component(passthrough));
		};

		check();

		// re-created elements belong to the same instance
		const button = /** @type {HTMLButtonElement} */ (target.querySelector('button'));
		flushSync(() => button.click());
		flushSync(() => button.click());
		check();
	}
});
