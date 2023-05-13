import Renderer from '../Renderer';
import Block from '../Block';
import Text from '../../nodes/Text';
import Wrapper from './shared/Wrapper';
import { x } from 'code-red';
import { Identifier } from 'estree';

export default class TextWrapper extends Wrapper {
	node: Text;
	_data: string;
	skip: boolean;
	var: Identifier;

	constructor(renderer: Renderer, block: Block, parent: Wrapper, node: Text, data: string) {
		super(renderer, block, parent, node);

		this.skip = this.node.should_skip();
		this._data = data;
		this.var = (this.skip ? null : x`t`) as unknown as Identifier;
	}

	use_space() {
		return this.node.use_space();
	}

	set data(value: string) {
		// when updating `this.data` during optimisation
		// propagate the changes over to the underlying node
		// so that the node.use_space reflects on the latest `data` value
		this.node.data = this._data = value;
	}
	get data() {
		return this._data;
	}

	render(block: Block, parent_node: Identifier, parent_nodes: Identifier) {
		if (this.skip) return;
		const use_space = this.use_space();

		const string_literal = {
			type: 'Literal',
			value: this.data,
			loc: {
				start: this.renderer.locate(this.node.start),
				end: this.renderer.locate(this.node.end)
			}
		};

		block.add_element(
			this.var,
			use_space ? x`@space()` : x`@text(${string_literal})`,
			parent_nodes &&
				(use_space
					? x`@claim_space(${parent_nodes})`
					: x`@claim_text(${parent_nodes}, ${string_literal})`),
			parent_node as Identifier
		);
	}
}
