import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import stringifyAttributeValue from './shared/stringifyAttributeValue';

export default function visitDocument(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	const title = node.attributes.find(attribute => attribute.type === 'Attribute' && attribute.name === 'title');

	if (title) {
		generator.append('${(__result.title = `' + stringifyAttributeValue(block, title.value) + '`, "")}');
	}
}