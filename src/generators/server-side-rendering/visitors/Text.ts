import { SsrGenerator } from '../index';
import Block from '../Block';
import { escape } from '../../../utils/stringify';
import { Node } from '../../../interfaces';

export default function visitText(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	generator.append(escape(node.data).replace(/(\${|`|\\)/g, '\\$1'));
}
