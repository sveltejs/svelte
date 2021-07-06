import Renderer, { RenderOptions } from '../Renderer';
import SlotTemplate from '../../nodes/SlotTemplate';
import remove_whitespace_children from './utils/remove_whitespace_children';
import { get_slot_scope } from './shared/get_slot_scope';
import InlineComponent from '../../nodes/InlineComponent';
import Element from '../../nodes/Element';

export default function(node: SlotTemplate | Element | InlineComponent, renderer: Renderer, options: RenderOptions & {
	slot_scopes: Map<any, any>;
}) {
	const parent_inline_component = node.parent as InlineComponent;
	const children = remove_whitespace_children(node instanceof SlotTemplate ? node.children : [node], node.next);

	renderer.push();
	renderer.render(children, options);

	const lets = node.lets;
	const seen = new Set(lets.map(l => l.name.name));
	parent_inline_component.lets.forEach(l => {
		if (!seen.has(l.name.name)) lets.push(l);
	});

	const slot_fragment_content = renderer.pop();
	if (!is_empty_template_literal(slot_fragment_content)) {
		if (options.slot_scopes.has(node.slot_template_name)) {
			if (node.slot_template_name === 'default') {
				throw new Error('Found elements without slot attribute when using slot="default"');
			}
			throw new Error(`Duplicate slot name "${node.slot_template_name}" in <${parent_inline_component.name}>`);
		}

		options.slot_scopes.set(node.slot_template_name, {
			input: get_slot_scope(node.lets),
			output: slot_fragment_content
		});
	}
}

function is_empty_template_literal(template_literal) {
	return (
		template_literal.expressions.length === 0 &&
		template_literal.quasis.length === 1 &&
		template_literal.quasis[0].value.raw === ''
	);
}
