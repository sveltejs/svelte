import { x } from 'code-red';
import { get_const_tags } from './shared/get_const_tags.js';

/**
 * @param {AwaitBlock} node
 * @param {Renderer} renderer
 * @param {import('../Renderer').RenderOptions} options
 */
export default function (node, renderer, options) {
    renderer.push();
    renderer.render(node.pending.children, options);

 /**
 * @type {undefined}
 */
    const pending = renderer.pop();
    renderer.push();
    renderer.render(node.then.children, options);

 /**
 * @type {undefined}
 */
    const then = renderer.pop();
    renderer.add_expression(x `
		function(__value) {
			if (@is_promise(__value)) {
				__value.then(null, @noop);
				return ${pending};
			}
			return (function(${node.then_node ? node.then_node : ''}) { ${get_const_tags(node.then.const_tags)}; return ${then}; }(__value));
		}(${node.expression.node})
	`);
}




