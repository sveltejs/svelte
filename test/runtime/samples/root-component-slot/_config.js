import { createSlot, slot } from 'svelte';

export default {
	options(window) {
		const default_el = window.document.createElement('div');
		default_el.innerHTML = 'default slot custom content';
		const my_slot_el1 = window.document.createElement('div');
		my_slot_el1.innerHTML = 'first my slot element';
		const my_slot_el2 = window.document.createElement('div');
		my_slot_el2.innerHTML = 'second my slot element';
		const my_slot_els = [my_slot_el1, my_slot_el2];
		const another_slot_el = window.document.createTextNode('another slot');
		const conditional_slot_el = window.document.createElement('div');
		conditional_slot_el.innerHTML = 'conditional slot';
		const Nested = require('./nested.svelte').default;
		return {
			slots: createSlot({
				default: default_el,
				'my-slot': my_slot_els,
				'another-slot-with-content': another_slot_el,
				'conditional-slot': conditional_slot_el,
				'slot-with-content-from-nested': slot(Nested)
			})
		};
	},

	test({ assert, component, target }) {
		const expectedHtmlWhenSlotIsVisible = `
		default slot: <div>default slot custom content</div>
		named slot: <div>first my slot element</div><div>second my slot element</div>
		slot with default content: default content
		another slot with content: another slot
		slot with content from nested: <div>this div is in nested.svelte</div><span>this span is in nested.svelte</span>
		conditional slot: <div>conditional slot</div>
		conditional slot with content: default content`;

		assert.htmlEqual(target.innerHTML, expectedHtmlWhenSlotIsVisible);

		component.is_slot_visible = false;
		assert.htmlEqual(target.innerHTML, `
			default slot: <div>default slot custom content</div>
			named slot: <div>first my slot element</div><div>second my slot element</div>
			slot with default content: default content
			another slot with content: another slot
			slot with content from nested: <div>this div is in nested.svelte</div><span>this span is in nested.svelte</span>`);

		component.is_slot_visible = true;
		assert.htmlEqual(target.innerHTML, expectedHtmlWhenSlotIsVisible);
		// @TODO once src/compiler/compile/render_dom/Block.ts is extended to expose created HTML elements
		// and nested component can be referenced directly, test mutating nested child props
	}
};
