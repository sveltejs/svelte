import Renderer, { RenderOptions } from '../Renderer';
import AwaitBlock from '../../nodes/AwaitBlock';
import { x } from 'code-red';
import { get_const_tags } from './shared/get_const_tags';

export default function(node: AwaitBlock, renderer: Renderer, options: RenderOptions) {
	renderer.push();
	renderer.render(node.pending.children, options);
	const pending = renderer.pop();

	renderer.push();
	renderer.render(node.then.children, options);
	const then = renderer.pop();

	renderer.add_expression(x`
		function(__value) {
			if (@is_promise(__value)) {
				__value.then(null, @noop);
				return ${pending};
			}
			return (function(${node.then_node ? node.then_node : ''}) { ${get_const_tags(node.then.const_tags)}; return ${then}; }(__value));
		}(${node.expression.node})
	`);
}
