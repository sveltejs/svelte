import { SsrGenerator } from '../index';
import Block from '../Block';
import { escape, escapeHTML, escapeTemplate } from '../../../utils/stringify';
import { Node } from '../../../interfaces';

export default function visitText(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	generator.append(escapeTemplate(escapeHTML(escape(node.data))));
}
