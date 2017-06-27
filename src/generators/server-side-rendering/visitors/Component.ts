import flattenReference from '../../../utils/flattenReference';
import visit from '../visit';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import getObject from '../../../utils/getObject';
import getTailSnippet from '../../../utils/getTailSnippet';

export default function visitComponent(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	function stringifyAttribute(chunk: Node) {
		if (chunk.type === 'Text') return chunk.data;
		if (chunk.type === 'MustacheTag') {
			const { snippet } = block.contextualise(chunk.expression);
			return '${__escape( ' + snippet + ')}';
		}
	}

	const attributes: Node[] = [];
	const bindings: Node[] = [];

	node.attributes.forEach((attribute: Node) => {
		if (attribute.type === 'Attribute') {
			attributes.push(attribute);
		} else if (attribute.type === 'Binding') {
			bindings.push(attribute);
		}
	});

	const props = attributes
		.map(attribute => {
			let value;

			if (attribute.value === true) {
				value = `true`;
			} else if (attribute.value.length === 0) {
				value = `''`;
			} else if (attribute.value.length === 1) {
				const chunk = attribute.value[0];
				if (chunk.type === 'Text') {
					value = isNaN(chunk.data) ? JSON.stringify(chunk.data) : chunk.data;
				} else {
					const { snippet } = block.contextualise(chunk.expression);
					value = snippet;
				}
			} else {
				value = '`' + attribute.value.map(stringifyAttribute).join('') + '`';
			}

			return `${attribute.name}: ${value}`;
		})
		.concat(
			bindings.map(binding => {
				const { name } = getObject(binding.value);
				const tail = binding.value.type === 'MemberExpression'
					? getTailSnippet(binding.value)
					: '';

				const keypath = block.contexts.has(name)
					? `${name}${tail}`
					: `state.${name}${tail}`;
				return `${binding.name}: ${keypath}`;
			})
		)
		.join(', ');

	const expression = node.name === ':Self'
		? generator.name
		: generator.importedComponents.get(node.name) ||
				`@template.components.${node.name}`;

	bindings.forEach(binding => {
		block.addBinding(binding, expression);
	});

	let open = `\${${expression}.render({${props}}`;

	if (node.children.length) {
		open += `, { yield: () => \``;
	}

	generator.append(open);

	generator.elementDepth += 1;

	node.children.forEach((child: Node) => {
		visit(generator, block, child);
	});

	generator.elementDepth -= 1;

	const close = node.children.length ? `\` })}` : ')}';
	generator.append(close);
}
