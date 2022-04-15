import Renderer, { RenderOptions } from '../Renderer';
import RawMustacheTag from '../../nodes/RawMustacheTag';
import { Expression } from 'estree';

export default function(node: RawMustacheTag, renderer: Renderer, options: RenderOptions) {
	if (options.hydratable && !options.optimised_html_hydration) renderer.add_string('<!-- HTML_TAG_START -->');
	renderer.add_expression(node.expression.node as Expression);
	if (options.hydratable && !options.optimised_html_hydration) renderer.add_string('<!-- HTML_TAG_END -->');
}
