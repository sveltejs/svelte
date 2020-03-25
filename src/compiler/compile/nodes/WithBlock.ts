import Expression from './shared/Expression';
import map_children from './shared/map_children';
import TemplateScope from './shared/TemplateScope';
import AbstractBlock from './shared/AbstractBlock';
import { x } from 'code-red';
import { Node, Identifier, RestElement } from 'estree';

interface Context {
	key: Identifier;
	name?: string;
	modifier: (node: Node) => Node;
}

function unpack_destructuring(contexts: Context[], node: Node, modifier: (node: Node) => Node) {
	if (!node) return;

	if (node.type === 'Identifier' || (node as any).type === 'RestIdentifier') { // TODO is this right? not RestElement?
		contexts.push({
			key: node as Identifier,
			modifier
		});
	} else if (node.type === 'ArrayPattern') {
		node.elements.forEach((element, i) => {
			if (element && (element as any).type === 'RestIdentifier') {
				unpack_destructuring(contexts, element, node => x`${modifier(node)}.slice(${i})` as Node);
			} else {
				unpack_destructuring(contexts, element, node => x`${modifier(node)}[${i}]` as Node);
			}
		});
	} else if (node.type === 'ObjectPattern') {
		const used_properties = [];

		node.properties.forEach((property, i) => {
			if ((property as any).kind === 'rest') { // TODO is this right?
				const replacement: RestElement = {
					type: 'RestElement',
					argument: property.key as Identifier
				};

				node.properties[i] = replacement as any;

				unpack_destructuring(
					contexts,
					property.value,
					node => x`@object_without_properties(${modifier(node)}, [${used_properties}])` as Node
				);
			} else {
				used_properties.push(x`"${(property.key as Identifier).name}"`);

				unpack_destructuring(contexts, property.value, node => x`${modifier(node)}.${(property.key as Identifier).name}` as Node);
			}
		});
	}
}

export default class WithBlock extends AbstractBlock {
	type: 'WithBlock';

	expression: Expression;
	context_node: Node;

	context: string;
	scope: TemplateScope;
	contexts: Context[];
	has_binding = false;

	constructor(component, parent, scope, info) {
		super(component, parent, scope, info);

		this.expression = new Expression(component, this, scope, info.expression);
		this.context = info.context.name || 'with'; // TODO this is used to facilitate binding; currently fails with destructuring
		this.context_node = info.context;
		this.scope = scope.child();

		this.contexts = [];
		unpack_destructuring(this.contexts, info.context, node => node);

		this.contexts.forEach(context => {
			this.scope.add(context.key.name, this.expression.dependencies, this);
		});

		this.children = map_children(component, this, this.scope, info.children);

		this.warn_if_empty_block();
	}
}
