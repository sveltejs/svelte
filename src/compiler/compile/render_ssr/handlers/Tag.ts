import { x } from 'code-red';

/**
 * @param {any} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} _options
 */
export default function (node, renderer, _options) {
	const snippet = node.expression.node;
	renderer.add_expression(
		node.parent && node.parent.type === 'Element' && node.parent.name === 'style'
			? snippet
			: x`@escape(${snippet})`
	);
}
