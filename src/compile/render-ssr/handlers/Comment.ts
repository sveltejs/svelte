import Renderer from '../Renderer';
import { CompileOptions } from '../../../interfaces';

export default function(node, target: Renderer, options: CompileOptions) {
	if (options.preserveComments) {
		target.append(`<!--${node.data}-->`);
	}
}