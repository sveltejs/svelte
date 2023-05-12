import { x } from 'code-red';

/**
 * @param {import('../../nodes/Title.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	renderer.push();
	renderer.add_string('<title>');
	renderer.render(node.children, options);
	renderer.add_string('</title>');
	const result = renderer.pop();
	renderer.add_expression(x`$$result.title = ${result}, ""`);
}
