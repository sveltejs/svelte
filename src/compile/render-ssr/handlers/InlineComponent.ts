import { escape, escapeTemplate, stringify } from '../../../utils/stringify';
import getObject from '../../../utils/getObject';
import { get_tail_snippet } from '../../../utils/get_tail_snippet';
import { quoteNameIfNecessary, quotePropIfNecessary } from '../../../utils/quoteIfNecessary';
import deindent from '../../../utils/deindent';
import { snip } from '../utils';
import Renderer from '../Renderer';
import stringifyProps from '../../../utils/stringifyProps';

type AppendTarget = any; // TODO

function stringifyAttribute(chunk: Node) {
	if (chunk.type === 'Text') {
		return escapeTemplate(escape(chunk.data));
	}

	return '${@escape( ' + snip(chunk) + ')}';
}

function getAttributeValue(attribute) {
	if (attribute.isTrue) return `true`;
	if (attribute.chunks.length === 0) return `''`;

	if (attribute.chunks.length === 1) {
		const chunk = attribute.chunks[0];
		if (chunk.type === 'Text') {
			return stringify(chunk.data);
		}

		return snip(chunk);
	}

	return '`' + attribute.chunks.map(stringifyAttribute).join('') + '`';
}

function stringifyObject(props) {
	return props.length > 0
		? `{ ${props.join(', ')} }`
		: `{};`
}

export default function(node, renderer: Renderer, options) {
	const binding_props = [];
	const binding_fns = [];

	node.bindings.forEach(binding => {
		renderer.has_bindings = true;

		// TODO this probably won't work for contextual bindings
		const snippet = snip(binding.expression);

		binding_props.push(`${binding.name}: ${snippet}`);
		binding_fns.push(`${binding.name}: $$value => { ${snippet} = $$value; $$settled = false }`);
	});

	const usesSpread = node.attributes.find(attr => attr.isSpread);

	let props;

	if (usesSpread) {
		props = `Object.assign(${
			node.attributes
				.map(attribute => {
					if (attribute.isSpread) {
						return snip(attribute.expression);
					} else {
						return `{ ${attribute.name}: ${getAttributeValue(attribute)} }`;
					}
				})
				.concat(binding_props.map(p => `{ ${p} }`))
				.join(', ')
		})`;
	} else {
		props = stringifyProps(
			node.attributes
				.map(attribute => `${attribute.name}: ${getAttributeValue(attribute)}`)
				.concat(binding_props)
		);
	}

	const bindings = stringifyProps(binding_fns);

	const expression = (
		node.name === 'svelte:self'
			? node.component.name
			: node.name === 'svelte:component'
				? `((${snip(node.expression)}) || @missingComponent)`
				: node.name
	);

	const slot_fns = [];

	if (node.children.length) {
		const target: AppendTarget = {
			slots: { default: '' },
			slotStack: ['default']
		};

		renderer.targets.push(target);

		renderer.render(node.children, options);

		Object.keys(target.slots).forEach(name => {
			slot_fns.push(
				`${quoteNameIfNecessary(name)}: () => \`${target.slots[name]}\``
			);
		});

		renderer.targets.pop();
	}

	const slots = stringifyProps(slot_fns);

	renderer.append(`\${@validate_component(${expression}, '${node.name}').$$render($$result, ${props}, ${bindings}, ${slots})}`);
}