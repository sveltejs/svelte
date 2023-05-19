import { x, p } from 'code-red';

/**
 * @param {import('../../nodes/DebugTag.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	if (!options.dev) return;
	const filename = options.filename || null;
	const { line, column } = options.locate(node.start + 1);
	const obj = x`{
		${node.expressions.map((e) => p`${/** @type {import('estree').Identifier} */ (e.node).name}`)}
	}`;
	renderer.add_expression(
		x`@debug(${filename ? x`"${filename}"` : x`null`}, ${line - 1}, ${column}, ${obj})`
	);
}
