import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

export default test({
	test({ assert, component, target }) {
		// we mounted the component in the root fragment so the div is in the target.elements_children
		const [div] = target.elements_children;
		assert.instanceOf(div, HTMLDivElement);

		// find the custom-rendered element in the div and assert the json content
		let custom_rendered = div.querySelector('custom-rendered');
		assert.instanceOf(custom_rendered, HTMLElement);
		assert.deepEqual(JSON.parse(custom_rendered.textContent), {
			type: 'element',
			name: 'div',
			attributes: {},
			children: [
				{
					type: 'element',
					name: 'span',
					attributes: {},
					children: [{ type: 'text', value: 'hello from child' }],
					elements_children: [],
					listeners: {}
				}
			],
			elements_children: [],
			listeners: {}
		});

		component.hide();
		flushSync();

		// we unmounted the custom rendered component so the map is empty again
		assert.equal(div.querySelector('custom-rendered'), null);

		component.show();
		flushSync();

		// we mounted the custom rendered component into the div again so it's in the mounted_in_dom_elements map again
		custom_rendered = div.querySelector('custom-rendered');
		assert.instanceOf(custom_rendered, HTMLElement);
	}
});
