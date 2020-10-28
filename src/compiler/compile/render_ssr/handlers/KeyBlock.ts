import KeyBlock from '../../nodes/KeyBlock.ts';
import Renderer, { RenderOptions } from '../Renderer.ts';

export default function(node: KeyBlock, renderer: Renderer, options: RenderOptions) {
	renderer.render(node.children, options);
}
