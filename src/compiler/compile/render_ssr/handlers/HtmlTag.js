/**
 * @param {import('../../nodes/RawMustacheTag.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	if (options.hydratable) renderer.add_string('<!-- HTML_TAG_START -->');
	renderer.add_expression(/** @type {import('estree').Expression} */ (node.expression.node));
	if (options.hydratable) renderer.add_string('<!-- HTML_TAG_END -->');
}
