import { x } from 'code-red';

/**
 * @param {import('../../nodes/RawMustacheTag.js').default} node
 * @param {import('../Renderer.js').default} renderer
 * @param {import('../private.js').RenderOptions} options
 */
export default function (node, renderer, options) {
	if (!options.hydratable) {
		renderer.add_expression(/** @type {import('estree').Expression} */ (node.expression.node));
	} else {
		renderer.add_expression(x`(() => {
		const #html_string = ${node.expression.node} + '';
		const #hash = /* @__PURE__ */ @hash(#html_string);

		return \`<!-- HTML_\${#hash}_START -->\${#html_string}<!-- HTML_\${#hash}_END -->\`;
	})()`);
	}
}
