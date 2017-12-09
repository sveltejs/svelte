import { stringify } from '../../utils/stringify';
import Node from './shared/Node';
import Block from '../dom/Block';
import { State } from '../dom/interfaces';

// Whitespace inside one of these elements will not result in
// a whitespace node being created in any circumstances. (This
// list is almost certainly very incomplete)
const elementsWithoutText = new Set([
	'audio',
	'datalist',
	'dl',
	'ol',
	'optgroup',
	'select',
	'ul',
	'video',
]);

export default class Text extends Node {
	data: string;
	shouldSkip: boolean;

	init(block: Block, state: State) {
		if (!/\S/.test(this.data) && (state.namespace || elementsWithoutText.has(state.parentNodeName))) {
			this.shouldSkip = true;
			return;
		}

		this.var = block.getUniqueName(`text`);
	}

	build(
		block: Block,
		state: State,
		elementStack: Node[],
		componentStack: Node[]
	) {
		if (this.shouldSkip) return;

		block.addElement(
			this.var,
			`@createText(${stringify(this.data)})`,
			`@claimText(${state.parentNodes}, ${stringify(this.data)})`,
			state.parentNode
		);
	}
}