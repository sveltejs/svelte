import { flushSync } from 'svelte';
import { test } from '../../test';

const image = 'background-image: url("a;b.png") !important;';

export default test({
	test({ assert, target, dispatch_event }) {
		const div = target.children.find((/** @type {any} */ n) => n.name === 'div');
		const [color, size, base] = target.children.filter(
			(/** @type {any} */ n) => n.name === 'button'
		);

		/** @param {any} button */
		const click = (button) => {
			dispatch_event(button, 'click');
			flushSync();
		};

		assert.equal(div.attributes.style, `margin: 0; color: red; --size: 1; ${image}`);

		// directives change, the `style` attribute doesn't
		click(color);
		assert.equal(div.attributes.style, `margin: 0; --size: 1; ${image}`);

		click(size);
		assert.equal(div.attributes.style, `margin: 0; --size: 2; ${image}`);

		click(color);
		assert.equal(div.attributes.style, `margin: 0; color: red; --size: 2; ${image}`);

		// the `style` attribute changes
		click(base);
		assert.equal(div.attributes.style, `padding: 1px; color: red; --size: 2; ${image}`);
	}
});
