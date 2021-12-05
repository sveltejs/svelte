import Renderer, { RenderOptions } from '../Renderer';
import EachBlock from '../../nodes/EachBlock';
import { x } from 'code-red';

export default function(node: EachBlock, renderer: Renderer, options: RenderOptions) {
	const args = [node.context_node];
	if (node.index) args.push({ type: 'Identifier', name: node.index });

	renderer.push();
	renderer.render(node.children, options);
	const result = renderer.pop();

	const consequent = x`@each(${node.expression.node}, (${args}) => ${result})`;

	if (node.else) {
		renderer.push();
		renderer.render(node.else.children, options);
		const alternate = renderer.pop();

		renderer.add_expression(x`${node.expression.node}.length ? ${consequent} : ${alternate}`);
	} else {
		renderer.add_expression(consequent);
	}
}
