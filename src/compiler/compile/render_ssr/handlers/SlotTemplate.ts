import Renderer, { RenderOptions } from '../Renderer';
import SlotTemplate from '../../nodes/SlotTemplate';
import remove_whitespace_children from './utils/remove_whitespace_children';
import { get_slot_scope } from './shared/get_slot_scope';
import InlineComponent from '../../nodes/InlineComponent';
import { get_const_tags } from './shared/get_const_tags';
import { x } from 'code-red';
import { INode } from '../../nodes/interfaces';

export default function(node: SlotTemplate, renderer: Renderer, options: RenderOptions) {
	const parent_inline_component = get_parent_inline_component(node.parent);
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
		options.slot_scopes.push(x`#slots_definition['${node.slot_template_name}'] = 
			(${get_slot_scope(node.lets)}) => { ${get_const_tags(node.const_tags)}; return ${slot_fragment_content}; }
		`);
	}
}

function is_empty_template_literal(template_literal) {
	return (
		template_literal.expressions.length === 0 &&
		template_literal.quasis.length === 1 &&
		template_literal.quasis[0].value.raw === ''
	);
}

function get_parent_inline_component(node: INode) {
	let parent = node;
	while (parent.type !== 'InlineComponent') {
		parent = parent.parent;
	}
	return parent as InlineComponent;
}
