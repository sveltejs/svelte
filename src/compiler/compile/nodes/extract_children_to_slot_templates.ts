import { x } from 'code-red';
import { TemplateNode } from '../../interfaces';
import { regex_only_whitespaces } from '../../utils/patterns';
import compiler_errors from '../compiler_errors';
import Component from '../Component';

export function extract_children_to_slot_templates(component: Component, node: TemplateNode, extract_default_slot: boolean) {
	const result = [];
	for (let i = node.children.length - 1; i >= 0; i--) {
		const child = node.children[i];
		if (child.type === 'SlotTemplate') {
			result.push(child);
			node.children.splice(i, 1);
		} else if ((child.type === 'Element' || child.type === 'InlineComponent' || child.type === 'Slot') && child.attributes.find(attribute => attribute.name === 'slot')) {
			let slot_template = {
				start: child.start,
				end: child.end,
				type: 'SlotTemplate',
				name: 'svelte:fragment',
				attributes: [],
				children: [child]
			};

			// transfer attributes
			for (let i = child.attributes.length - 1; i >= 0; i--) {
				const attribute = child.attributes[i];
				if (attribute.type === 'Let') {
					slot_template.attributes.push(attribute);
					child.attributes.splice(i, 1);
				} else if (attribute.type === 'Attribute' && attribute.name === 'slot') {
					slot_template.attributes.push(attribute);
				}
			}
			// transfer const
			for (let i = child.children.length - 1; i >= 0; i--) {
				const child_child = child.children[i];
				if (child_child.type === 'ConstTag') {
					slot_template.children.push(child_child);
					child.children.splice(i, 1);
				}
			}

			// if the <slot slot="x"> does not have any fallback
			// then we make <slot slot="x" name="b" />
			// into {#if $$slots.x}<slot slot="x" name="b" />{/if}
			// this makes the slots forwarding to passthrough
			if (child.type === 'Slot' && child.children.length === 0) {
				const slot_template_name = child.attributes.find(attribute => attribute.name === 'name')?.value[0].data ?? 'default';
				slot_template = {
					start: slot_template.start,
					end: slot_template.end,
					type: 'SlotTemplateIfBlock',
					expression: x`$$slots.${slot_template_name}`,
					children: [slot_template]
				} as any;
			}

			result.push(slot_template);
			node.children.splice(i, 1);
		} else if (child.type === 'Comment' && result.length > 0) {
			result[result.length - 1].children.unshift(child);
			node.children.splice(i, 1);
		} else if (child.type === 'Text' && regex_only_whitespaces.test(child.data)) {
			// ignore
		} else if (child.type === 'ConstTag') {
			if (!extract_default_slot) {
				result.push(child);
			}
		} else if (child.type === 'IfBlock' && if_block_contains_slot_template(child)) {
			result.push({
				...child,
				type: 'SlotTemplateIfBlock'
			});
			node.children.splice(i, 1);
		} else if (!extract_default_slot) {
			component.error(child, compiler_errors.invalid_mix_element_and_conditional_slot);
		}
	}

	if (extract_default_slot) {
		if (node.children.some(node => not_whitespace_text(node))) {
			result.push({
				start: node.start,
				end: node.end,
				type: 'SlotTemplate',
				name: 'svelte:fragment',
				attributes: [],
				children: node.children
			});
		}
	}
	return result.reverse();
}


function not_whitespace_text(node) {
	return !(node.type === 'Text' && regex_only_whitespaces.test(node.data));
}

function if_block_contains_slot_template(node: TemplateNode) {
	for (const child of node.children) {
		if (child.type === 'SlotTemplate') return true;
		if (child.type === 'IfBlock' && if_block_contains_slot_template(child)) return true;
		if ((child.type === 'Element' || child.type === 'InlineComponent' || child.type === 'Slot') && child.attributes.find(attribute => attribute.name === 'slot')) return true;
	}
	return false;
}
