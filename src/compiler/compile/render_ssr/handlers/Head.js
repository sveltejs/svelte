import { x } from 'code-red';

/**
 * @param {import('../../nodes/Head.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	const head_options = {
		...options,
		head_id: node.id
	};
	renderer.push();
	renderer.render(node.children, head_options);
	const result = renderer.pop();

	/** @type {import('estree').Node} */
	let expression = result;
	if (options.hydratable) {
		const start_comment = `HEAD_${node.id}_START`;
		const end_comment = `HEAD_${node.id}_END`;
		expression = x`'<!-- ${start_comment} -->' + ${expression} + '<!-- ${end_comment} -->'`;
	}
	renderer.add_expression(x`$$result.head += ${expression}, ""`);
}
