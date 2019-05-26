import Renderer, { RenderOptions } from '../Renderer';
import { snip } from '../../utils/snip';
import AwaitBlock from '../../nodes/AwaitBlock';

export default function(node: AwaitBlock, renderer: Renderer, options: RenderOptions) {
	renderer.append('${(function(__value) { if(@is_promise(__value)) return `');

	renderer.render(node.pending.children, options);

	renderer.append('`; return function(' + (node.value || '') + ') { return `');

	renderer.render(node.then.children, options);

	const snippet = snip(node.expression);
	renderer.append(`\`;}(__value);}(${snippet})) }`);
}
