import flattenReference from '../../../utils/flattenReference';
import visit from '../visit';
import { SsrGenerator } from '../index';
import Block from '../Block';
import { AppendTarget } from '../interfaces';
import { Node } from '../../../interfaces';
import getObject from '../../../utils/getObject';
import getTailSnippet from '../../../utils/getTailSnippet';
import { escape, escapeTemplate, stringify } from '../../../utils/stringify';

export default function visitComponent(
	generator: SsrGenerator,
	block: Block,
	node: Node
) {
	function stringifyAttribute(chunk: Node) {
		if (chunk.type === 'Text') {
			return escapeTemplate(escape(chunk.data));
		}

		return '${__escape( ' + chunk.snippet + ')}';
	}

	const bindingProps = node.bindings.map(binding => {
		const { name } = getObject(binding.value.node);
		const tail = binding.value.node.type === 'MemberExpression'
			? getTailSnippet(binding.value.node)
			: '';

		return `${binding.name}: ctx.${name}${tail}`;
	});

	function getAttributeValue(attribute) {
		if (attribute.isTrue) return `true`;
		if (attribute.chunks.length === 0) return `''`;

		if (attribute.chunks.length === 1) {
			const chunk = attribute.chunks[0];
			if (chunk.type === 'Text') {
				return stringify(chunk.data);
			}

			return chunk.snippet;
		}

		return '`' + attribute.chunks.map(stringifyAttribute).join('') + '`';
	}

	const usesSpread = node.attributes.find(attr => attr.isSpread);

	const props = usesSpread
		? `Object.assign(${
			node.attributes
				.map(attribute => {
					if (attribute.isSpread) {
						return attribute.expression.snippet;
					} else {
						return `{ ${attribute.name}: ${getAttributeValue(attribute)} }`;
					}
				})
				.concat(bindingProps.map(p => `{ ${p} }`))
				.join(', ')
		})`
		: `{ ${node.attributes
			.map(attribute => `${attribute.name}: ${getAttributeValue(attribute)}`)
			.concat(bindingProps)
			.join(', ')} }`;

	const isDynamicComponent = node.name === 'svelte:component';

	const expression = (
		node.name === 'svelte:self' ? generator.name :
		isDynamicComponent ? `((${node.expression.snippet}) || __missingComponent)` :
		`%components-${node.name}`
	);

	node.bindings.forEach(binding => {
		block.addBinding(binding, expression);
	});

	let open = `\${${expression}._render(__result, ${props}`;

	const options = [];
	options.push(`store: options.store`);

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
