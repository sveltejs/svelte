import { SsrGenerator } from '../index';
import Block from '../Block';
import { escape, escapeHTML, escapeTemplate } from '../../../utils/stringify';
import { Node } from '../../../interfaces';

export default function visitText(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	let text = node.data;
	if (
		!node.parent ||
		node.parent.type !== 'Element' ||
		(node.parent.name !== 'script' && node.parent.name !== 'style')
	) {
		// unless this Text node is inside a <script> or <style> element, escape &,<,>
		text = escapeHTML(text);
	}
	generator.append(escape(escapeTemplate(text)));
}
