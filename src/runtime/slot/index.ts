import { noop, insert, detach, FragmentMinimal, SvelteSlotOptions, SvelteComponentOptionsPrivate } from 'svelte/internal';
import { SvelteComponent } from '..';

function create_root_slot_fn(elements: Node[]) {
	return function (): FragmentMinimal {
		return {
			c: noop,

			m: function mount(target, anchor) {
				elements.forEach(element => {
					insert(target, element, anchor);
				});
			},

			d: function destroy(detaching) {
				if (detaching) {
					elements.forEach(detach);
				}
			},

			l: noop
		};
	};
}

export function createSlot(input: Record<string, Node | Node[]>) {
	const slots: Record<string, Array<ReturnType<typeof create_root_slot_fn>>> = {};
	for (const key in input) {
		const nodeOrNodeList = input[key];
		const nodeList = Array.isArray(nodeOrNodeList) ? nodeOrNodeList : [nodeOrNodeList];
		slots[key] = [create_root_slot_fn(nodeList)];
	}
	return slots;
}

export function slot(componentClass: typeof SvelteComponent, options: SvelteSlotOptions): Element[] {
	const wrapper = document.createElement('div');
	new componentClass({...options, target: wrapper} as SvelteComponentOptionsPrivate) as any;
	// @TODO this is a workaround until src/compiler/compile/render_dom/Block.ts is extended to expose created HTML element
	return Array.from(wrapper.children);
}
