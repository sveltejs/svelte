import IfBlock from '../../nodes/IfBlock';
import Renderer, { RenderOptions } from '../Renderer';
import { x } from 'code-red';

export default function(node: IfBlock, renderer: Renderer, options: RenderOptions) {
	const condition = node.expression.node;

	renderer.push();
	renderer.render(node.children, options);
	const consequent = renderer.pop();

	renderer.push();
	if (node.else) renderer.render(node.else.children, options);
	const alternate = renderer.pop();

	renderer.add_expression(x`${condition} ? ${consequent} : ${alternate}`);
}
