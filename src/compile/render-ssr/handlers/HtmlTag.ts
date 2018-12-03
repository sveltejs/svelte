import { snip } from '../utils';

export default function(node, renderer, options) {
	renderer.append('${' + snip(node.expression) + '}');
}