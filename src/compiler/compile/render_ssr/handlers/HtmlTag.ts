import Renderer, { RenderOptions } from '../Renderer';
import RawMustacheTag from '../../nodes/RawMustacheTag';
import { Expression } from 'estree';

export default function(node: RawMustacheTag, renderer: Renderer, _options: RenderOptions) {
	renderer.add_string('<!-- HTML_TAG_START -->');
	renderer.add_expression(node.expression.node as Expression);
	renderer.add_string('<!-- HTML_TAG_END -->');
}
