import ConstTag from '../../../nodes/ConstTag';
import Block from '../../Block';
import { b, Node, x } from 'code-red';
import Renderer from '../../Renderer';
import Expression from '../../../nodes/shared/Expression';

export function add_const_tags(block: Block, const_tags: ConstTag[], ctx: string) {
	const const_tags_props = [];
	const_tags.forEach((const_tag, i) => {
		const name = `#constants_${i}`;
		const_tags_props.push(b`const ${name} = ${const_tag.expression.manipulate(block, ctx)}`);
		const to_ctx = (name: string) => block.renderer.context_lookup.has(name) ? x`${ctx}[${block.renderer.context_lookup.get(name).index}]` : { type: 'Identifier', name } as Node;

		const_tag.contexts.forEach(context => {
			if (context.type === 'DestructuredVariable') {
				const_tags_props.push(b`${ctx}[${block.renderer.context_lookup.get(context.key.name).index}] = ${context.default_modifier(context.modifier({ type: 'Identifier', name }), to_ctx)}`);
			} else {
				const expression = new Expression(block.renderer.component, const_tag, const_tag.scope, context.key);
				const_tags_props.push(b`const ${context.property_name} = ${expression.manipulate(block, ctx)}`);
			}
		});
	});
	return const_tags_props;
}

export function add_const_tags_context(renderer: Renderer, const_tags: ConstTag[]) {
	const_tags.forEach(const_tag => {
		const_tag.contexts.forEach(context => {
			if (context.type !== 'DestructuredVariable') return;
			renderer.add_to_context(context.key.name, true);
		});
	});
}
