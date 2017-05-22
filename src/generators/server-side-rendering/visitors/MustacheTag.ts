import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';

export default function visitMustacheTag ( generator: SsrGenerator, block: Block, node: Node ) {
	const { snippet } = block.contextualise( node.expression );
	generator.append( '${__escape( ' + snippet + ' )}' );
}