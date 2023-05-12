import { x } from 'code-red';
import { get_const_tags } from './shared/get_const_tags.js';

/**
 * @param {import('../../nodes/EachBlock.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	const args = [node.context_node];
	if (node.index) args.push({ type: 'Identifier', name: node.index });
	renderer.push();
	renderer.render(node.children, options);
	const result = renderer.pop();
	const consequent = x`@each(${node.expression.node}, (${args}) => { ${get_const_tags(
		node.const_tags
	)}; return ${result} })`;
	if (node.else) {
		renderer.push();
		renderer.render(node.else.children, options);
		/** @type {import('estree').Node} */
		let alternate = renderer.pop();
		if (node.else.const_tags.length > 0)
			alternate = x`(() => { ${get_const_tags(node.else.const_tags)}; return ${alternate} })()`;
		renderer.add_expression(x`${node.expression.node}.length ? ${consequent} : ${alternate}`);
	} else {
		renderer.add_expression(consequent);
	}
}
