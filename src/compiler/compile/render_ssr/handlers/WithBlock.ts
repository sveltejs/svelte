import Renderer, { RenderOptions } from '../Renderer';
import WithBlock from '../../nodes/WithBlock';
import { x } from 'code-red';

export default function(node: WithBlock, renderer: Renderer, options: RenderOptions) {
	const args = [node.context_node];

	renderer.push();
	renderer.render(node.children, options);
	const result = renderer.pop();
	renderer.add_expression(x`((${args}) => ${result})(${node.expression.node})`);
}
