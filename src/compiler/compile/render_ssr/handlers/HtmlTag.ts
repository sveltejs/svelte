import Renderer, { RenderOptions } from '../Renderer.ts';
import RawMustacheTag from '../../nodes/RawMustacheTag'.ts;

export default function(node: RawMustacheTag, renderer: Renderer, _options: RenderOptions) {
	renderer.add_expression(node.expression.node);
}
