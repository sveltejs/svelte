import Renderer from '../Renderer';
import { CompileOptions } from '../../../interfaces';
import { snip } from '../utils';

export default function(node, renderer: Renderer, options: CompileOptions) {
	renderer.append('${(function(__value) { if(@isPromise(__value)) return `');

	renderer.render(node.pending.children, options);

	renderer.append('`; return function(ctx) { return `');

	renderer.render(node.then.children, options);

	const snippet = snip(node.expression);
	renderer.append(`\`;}(Object.assign({}, ctx, { ${node.value}: __value }));}(${snippet})) }`);
}