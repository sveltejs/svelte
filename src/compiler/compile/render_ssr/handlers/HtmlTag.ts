import Renderer, { RenderOptions } from '../Renderer';
import RawMustacheTag from '../../nodes/RawMustacheTag';
import { Expression } from 'estree';

export default function(node: RawMustacheTag, renderer: Renderer, _options: RenderOptions) {
	renderer.add_expression(node.expression.node as Expression);
}
