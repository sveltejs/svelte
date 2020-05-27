import Renderer, { RenderOptions } from '../Renderer';
import AwaitBlock from '../../nodes/AwaitBlock';
import { x } from 'code-red';

export default function(node: AwaitBlock, renderer: Renderer, options: RenderOptions) {
	renderer.push();
	renderer.render(node.pending.children, options);
	const pending = renderer.pop();

	renderer.push();
	renderer.render(node.then.children, options);
	const then = renderer.pop();

	renderer.add_expression(x`
		function(__value) {
			if (__value && typeof __value === 'object' && typeof __value.then === 'function') return ${pending};
			return (function(${node.then_node ? node.then_node : ''}) { return ${then}; }(__value));
		}(${node.expression.node})
	`);
}
