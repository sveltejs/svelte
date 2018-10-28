import { escape, escapeTemplate, stringify } from '../../../utils/stringify';
import getObject from '../../../utils/getObject';
import getTailSnippet from '../../../utils/getTailSnippet';
import { quoteNameIfNecessary, quotePropIfNecessary } from '../../../utils/quoteIfNecessary';
import deindent from '../../../utils/deindent';

type AppendTarget = any; // TODO

export default function(node, renderer, options) {
	function stringifyAttribute(chunk: Node) {
		if (chunk.type === 'Text') {
			return escapeTemplate(escape(chunk.data));
		}

		return '${@escape( ' + chunk.snippet + ')}';
	}

	const bindingProps = node.bindings.map(binding => {
		const { name } = getObject(binding.value.node);
		const tail = binding.value.node.type === 'MemberExpression'
			? getTailSnippet(binding.value.node)
			: '';

		return `${quoteNameIfNecessary(binding.name)}: ctx${quotePropIfNecessary(name)}${tail}`;
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
						return `{ ${quoteNameIfNecessary(attribute.name)}: ${getAttributeValue(attribute)} }`;
					}
				})
				.concat(bindingProps.map(p => `{ ${p} }`))
				.join(', ')
		})`
		: `{ ${node.attributes
			.map(attribute => `${quoteNameIfNecessary(attribute.name)}: ${getAttributeValue(attribute)}`)
			.concat(bindingProps)
			.join(', ')} }`;

	const expression = (
		node.name === 'svelte:self'
			? node.component.name
			: node.name === 'svelte:component'
				? `((${node.expression.snippet}) || @missingComponent)`
				: `%components-${node.name}`
	);

	node.bindings.forEach(binding => {
		const conditions = [];

		let parent = node;
		while (parent = parent.parent) {
			if (parent.type === 'IfBlock') {
				// TODO handle contextual bindings...
				conditions.push(`(${parent.expression.snippet})`);
			}
		}

		conditions.push(
			`!('${binding.name}' in ctx)`,
			`${expression}.data`
		);

		const { name } = getObject(binding.value.node);

		renderer.bindings.push(deindent`
			if (${conditions.reverse().join('&&')}) {
				tmp = ${expression}.data();
				if ('${name}' in tmp) {
					ctx${quotePropIfNecessary(binding.name)} = tmp.${name};
					settled = false;
				}
			}
		`);
	});

	let open = `\${@validateSsrComponent(${expression}, '${node.name}')._render(__result, ${props}`;

	const component_options = [];
	component_options.push(`store: options.store`);

	if (node.children.length) {
		const target: AppendTarget = {
			slots: { default: '' },
			slotStack: ['default']
		};

		renderer.targets.push(target);

		renderer.render(node.children, options);

		const slotted = Object.keys(target.slots)
			.map(name => `${quoteNameIfNecessary(name)}: () => \`${target.slots[name]}\``)
			.join(', ');

		component_options.push(`slotted: { ${slotted} }`);

		renderer.targets.pop();
	}

	if (component_options.length) {
		open += `, { ${component_options.join(', ')} }`;
	}

	renderer.append(open);
	renderer.append(')}');
}