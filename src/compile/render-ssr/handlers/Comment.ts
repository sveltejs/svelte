import Renderer from '../Renderer';
import { CompileOptions } from '../../../interfaces';

export default function(node, renderer: Renderer, options: CompileOptions) {
	if (options.preserveComments) {
		renderer.append(`<!--${node.data}-->`);
	}
}