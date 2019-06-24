import { snip } from '../../utils/snip';
import Renderer, { RenderOptions } from '../Renderer';
export default function(node, renderer: Renderer, _options: RenderOptions) {
	const snippet = snip(node.expression);

	renderer.append(
		node.parent &&
		node.parent.type === 'Element' &&
		node.parent.name === 'style'
			? '${' + snippet + '}'
			: '${@escape(' + snippet + ')}'
	);
}
