import Renderer, { RenderOptions } from '../Renderer';
import Comment from '../../nodes/Comment';

export default function(node: Comment, renderer: Renderer, options: RenderOptions) {
	// TODO preserve comments

	// if (options.preserveComments) {
	// 	renderer.append(`<!--${node.data}-->`);
	// }
}
