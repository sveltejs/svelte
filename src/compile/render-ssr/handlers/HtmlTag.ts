import { snip } from '../../../utils/snip';

export default function(node, renderer, options) {
	renderer.append('${' + snip(node.expression) + '}');
}