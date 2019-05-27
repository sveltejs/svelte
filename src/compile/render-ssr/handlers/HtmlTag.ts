import { snip } from '../../utils/snip';
import Renderer, { RenderOptions } from '../Renderer';
import RawMustacheTag from '../../nodes/RawMustacheTag';

export default function(node: RawMustacheTag, renderer: Renderer, options: RenderOptions) {
	renderer.append('${' + snip(node.expression) + '}');
}
