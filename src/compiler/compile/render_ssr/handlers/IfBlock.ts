import IfBlock from '../../nodes/IfBlock';
import Renderer, { RenderOptions } from '../Renderer';
import { x } from 'code-red';
import { get_const_tags } from './shared/get_const_tags';
import { Node } from 'estree';

export default function (node: IfBlock, renderer: Renderer, options: RenderOptions) {
	const condition = node.expression.node;

	renderer.push();
	renderer.render(node.children, options);
	let consequent: Node = renderer.pop();
	if (node.const_tags.length > 0) consequent = x`(() => { ${get_const_tags(node.const_tags)}; return ${consequent} })()`;

	renderer.push();
	if (node.else) renderer.render(node.else.children, options);
	let alternate: Node = renderer.pop();
	if (node.else && node.else.const_tags.length > 0) alternate = x`(() => { ${get_const_tags(node.else.const_tags)}; return ${alternate} })()`;

	renderer.add_expression(x`${condition} ? ${consequent} : ${alternate}`);
}
