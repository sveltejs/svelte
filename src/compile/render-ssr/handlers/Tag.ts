import { snip } from '../utils';

export default function(node, renderer, options) {
	const snippet = snip(node.expression);

	renderer.append(
		node.parent &&
		node.parent.type === 'Element' &&
		node.parent.name === 'style'
			? '${' + snippet + '}'
			: '${@escape(' + snippet + ')}'
	);
}