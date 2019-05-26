import { snip } from '../../utils/snip';
import IfBlock from '../../nodes/IfBlock';
import Renderer, { RenderOptions } from '../Renderer';
export default function(node: IfBlock, renderer: Renderer, options: RenderOptions) {
	const snippet = snip(node.expression);

	renderer.append('${ ' + snippet + ' ? `');

	renderer.render(node.children, options);

	renderer.append('` : `');

	if (node.else) {
		renderer.render(node.else.children, options);
	}

	renderer.append('` }');
}
