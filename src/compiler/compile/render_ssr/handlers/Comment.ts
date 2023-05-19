/**
 * @param {import('../../nodes/Comment.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	if (options.preserveComments) {
		renderer.add_string(`<!--${node.data}-->`);
	}
}
