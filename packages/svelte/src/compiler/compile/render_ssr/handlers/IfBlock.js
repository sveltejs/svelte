import { x } from 'code-red';
import { get_const_tags } from './shared/get_const_tags.js';

/**
 * @param {import('../../nodes/IfBlock.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	const condition = node.expression.node;
	renderer.push();
	renderer.render(node.children, options);

	/** @type {import('estree').Node} */
	let consequent = renderer.pop();
	if (node.const_tags.length > 0)
		consequent = x`(() => { ${get_const_tags(node.const_tags)}; return ${consequent} })()`;
	renderer.push();
	if (node.else) renderer.render(node.else.children, options);

	/** @type {import('estree').Node} */
	let alternate = renderer.pop();
	if (node.else && node.else.const_tags.length > 0)
		alternate = x`(() => { ${get_const_tags(node.else.const_tags)}; return ${alternate} })()`;
	renderer.add_expression(x`${condition} ? ${consequent} : ${alternate}`);
}
