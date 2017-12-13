import flattenReference from '../../../utils/flattenReference';
import visit from '../visit';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { AppendTarget } from '../interfaces';
import { Node } from '../../../interfaces';
import getObject from '../../../utils/getObject';
import getTailSnippet from '../../../utils/getTailSnippet';
import { stringify } from '../../../utils/stringify';

export default function visitComponent(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	function stringifyAttribute(chunk: Node) {
		if (chunk.type === 'Text') return chunk.data;
		if (chunk.type === 'MustacheTag') {
			block.contextualise(chunk.expression);
			const { snippet } = chunk.metadata;
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
					value = isNaN(chunk.data) ? stringify(chunk.data) : chunk.data;
				} else {
					block.contextualise(chunk.expression);
					const { snippet } = chunk.metadata;
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

	const isDynamicComponent = node.name === ':Component';
	if (isDynamicComponent) block.contextualise(node.expression);

	const expression = (
		node.name === ':Self' ? generator.name :
		isDynamicComponent ? `((${node.metadata.snippet}) || __missingComponent)` :
		`%components-${node.name}`
	);

	bindings.forEach(binding => {
		block.addBinding(binding, expression);
	});

	let open = `\${${expression}._render(__result, {${props}}`;

	const options = [];
	if (generator.options.store) {
		options.push(`store: options.store`);
	}

	if (node.children.length) {
		const appendTarget: AppendTarget = {
			slots: { default: '' },
			slotStack: ['default']
		};

		generator.appendTargets.push(appendTarget);

		node.children.forEach((child: Node) => {
			visit(generator, block, child);
		});

		const slotted = Object.keys(appendTarget.slots)
			.map(name => `${name}: () => \`${appendTarget.slots[name]}\``)
			.join(', ');

		options.push(`slotted: { ${slotted} }`);

		generator.appendTargets.pop();
	}

	if (options.length) {
		open += `, { ${options.join(', ')} }`;
	}

	generator.append(open);
	generator.append(')}');
}
