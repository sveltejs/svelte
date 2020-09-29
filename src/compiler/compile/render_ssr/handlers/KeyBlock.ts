import KeyBlock from '../../nodes/KeyBlock';
import Renderer, { RenderOptions } from '../Renderer';

export default function(node: KeyBlock, renderer: Renderer, options: RenderOptions) {
	renderer.render(node.children, options);
}
