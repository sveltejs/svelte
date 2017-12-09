import Node from './shared/Node';
import Block from '../dom/Block';
import State from '../dom/State';
import visitComponent from '../dom/visitors/Component';

export default class Component extends Node {
	type: 'Component'; // TODO fix this?
	name: string;
	attributes: Node[]; // TODO have more specific Attribute type
	children: Node[];

	init(
		block: Block,
		state: State,
		inEachBlock: boolean,
		elementStack: Node[],
		componentStack: Node[],
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

		this.attributes.forEach((attribute: Node) => {
			if (attribute.type === 'Attribute' && attribute.value !== true) {
				attribute.value.forEach((chunk: Node) => {
					if (chunk.type !== 'Text') {
						const dependencies = chunk.metadata.dependencies;
						block.addDependencies(dependencies);
					}
				});
			} else {
				if (attribute.type === 'EventHandler' && attribute.expression) {
					attribute.expression.arguments.forEach((arg: Node) => {
						block.addDependencies(arg.metadata.dependencies);
					});
				} else if (attribute.type === 'Binding') {
					block.addDependencies(attribute.metadata.dependencies);
				}
			}
		});

		this.var = block.getUniqueName(
			(
				this.name === ':Self' ? this.generator.name :
				this.name === ':Component' ? 'switch_instance' :
				this.name
			).toLowerCase()
		);

		this._state = state.child({
			parentNode: `${this.var}._slotted.default`
		});

		if (this.children.length) {
			this._slots = new Set(['default']);

			this.children.forEach(child => {
				child.init(block, state, inEachBlock, elementStack, componentStack.concat(this), stripWhitespace, nextSibling);
			});
		}
	}

	build(
		block: Block,
		state: State,
		elementStack: Node[],
		componentStack: Node[]
	) {
		visitComponent(this.generator, block, state, this, elementStack, componentStack);
	}
}