/**
 * @param {import('../../nodes/KeyBlock.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	renderer.render(node.children, options);
}
