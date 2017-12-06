import Node from './shared/Node';
import Block from '../dom/Block';
import State from '../dom/State';

export default class Element extends Node {
	type: 'Element';
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
		if (this.name === 'slot' || this.name === 'option') {
			this.cannotUseInnerHTML();
		}

		this.attributes.forEach((attribute: Node) => {
			if (attribute.type === 'Attribute' && attribute.value !== true) {
				attribute.value.forEach((chunk: Node) => {
					if (chunk.type !== 'Text') {
						if (this.parent) this.parent.cannotUseInnerHTML();

						const dependencies = chunk.metadata.dependencies;
						block.addDependencies(dependencies);

						// special case — <option value='{{foo}}'> — see below
						if (
							this.name === 'option' &&
							attribute.name === 'value' &&
							state.selectBindingDependencies
						) {
							state.selectBindingDependencies.forEach(prop => {
								dependencies.forEach((dependency: string) => {
									this.generator.indirectDependencies.get(prop).add(dependency);
								});
							});
						}
					}
				});
			} else {
				if (this.parent) this.parent.cannotUseInnerHTML();

				if (attribute.type === 'EventHandler' && attribute.expression) {
					attribute.expression.arguments.forEach((arg: Node) => {
						block.addDependencies(arg.metadata.dependencies);
					});
				} else if (attribute.type === 'Binding') {
					block.addDependencies(attribute.metadata.dependencies);
				} else if (attribute.type === 'Transition') {
					if (attribute.intro)
						this.generator.hasIntroTransitions = block.hasIntroMethod = true;
					if (attribute.outro) {
						this.generator.hasOutroTransitions = block.hasOutroMethod = true;
						block.outros += 1;
					}
				}
			}
		});

		const valueAttribute = this.attributes.find((attribute: Node) => attribute.name === 'value');

		// Treat these the same way:
		//   <option>{{foo}}</option>
		//   <option value='{{foo}}'>{{foo}}</option>
		if (this.name === 'option' && !valueAttribute) {
			this.attributes.push({
				type: 'Attribute',
				name: 'value',
				value: this.children
			});
		}

		// special case — in a case like this...
		//
		//   <select bind:value='foo'>
		//     <option value='{{bar}}'>bar</option>
		//     <option value='{{baz}}'>baz</option>
		//   </option>
		//
		// ...we need to know that `foo` depends on `bar` and `baz`,
		// so that if `foo.qux` changes, we know that we need to
		// mark `bar` and `baz` as dirty too
		if (this.name === 'select') {
			const binding = this.attributes.find((node: Node) => node.type === 'Binding' && node.name === 'value');
			if (binding) {
				// TODO does this also apply to e.g. `<input type='checkbox' bind:group='foo'>`?
				const dependencies = binding.metadata.dependencies;
				state.selectBindingDependencies = dependencies;
				dependencies.forEach((prop: string) => {
					this.generator.indirectDependencies.set(prop, new Set());
				});
			} else {
				state.selectBindingDependencies = null;
			}
		}

		const slot = this.getStaticAttributeValue('slot');
		if (slot && this.isChildOfComponent()) {
			this.cannotUseInnerHTML();
			this.slotted = true;
			// TODO validate slots — no nesting, no dynamic names...
			const component = componentStack[componentStack.length - 1];
			component._slots.add(slot);
		}

		this.var = block.getUniqueName(
			this.name.replace(/[^a-zA-Z0-9_$]/g, '_')
		);

		this._state = state.child({
			parentNode: this.var,
			parentNodes: block.getUniqueName(`${this.var}_nodes`),
			parentNodeName: this.name,
			namespace: this.name === 'svg'
				? 'http://www.w3.org/2000/svg'
				: state.namespace,
			allUsedContexts: [],
		});

		this.generator.stylesheet.apply(this, elementStack);

		if (this.children.length) {
			if (this.name === 'pre' || this.name === 'textarea') stripWhitespace = false;
			this.initChildren(block, this._state, inEachBlock, elementStack.concat(this), componentStack, stripWhitespace, nextSibling);
		}
	}

	getStaticAttributeValue(name: string) {
		const attribute = this.attributes.find(
			(attr: Node) => attr.name.toLowerCase() === name
		);

		if (!attribute) return null;

		if (attribute.value === true) return true;
		if (attribute.value.length === 0) return '';

		if (attribute.value.length === 1 && attribute.value[0].type === 'Text') {
			return attribute.value[0].data;
		}

		return null;
	}
}