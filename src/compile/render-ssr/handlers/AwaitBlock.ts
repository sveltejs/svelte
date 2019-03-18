import Renderer from '../Renderer';
import { CompileOptions } from '../../../interfaces';
import { snip } from '../../utils/snip';

export default function(node, renderer: Renderer, options: CompileOptions) {
	renderer.append('${(function(__value) { if(@is_promise(__value)) return `');

	renderer.render(node.pending.children, options);

	renderer.append('`; return function(' + (node.value || '') + ') { return `');

	renderer.render(node.then.children, options);

	const snippet = snip(node.expression);
	renderer.append(`\`;}(__value);}(${snippet})) }`);
}