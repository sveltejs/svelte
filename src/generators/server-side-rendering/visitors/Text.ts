import { SsrGenerator } from '../index';
import Block from '../Block';
import { escape, escapeHTML } from '../../../utils/stringify';
import { Node } from '../../../interfaces';

export default function visitText(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	generator.append(escapeHTML(escape(node.data).replace(/(\${|`|\\)/g, '\\$1')));
}
