import { escape, escape_template, stringify } from '../../utils/stringify';
import { quote_name_if_necessary } from '../../../utils/names';
import { snip } from '../../utils/snip';
import Renderer, { RenderOptions } from '../Renderer';
import { stringify_props } from '../../utils/stringify_props';
import { get_slot_scope } from './shared/get_slot_scope';
import { AppendTarget } from '../../../interfaces';
import InlineComponent from '../../nodes/InlineComponent';
import { INode } from '../../nodes/interfaces';
import Text from '../../nodes/Text';

function stringify_attribute(chunk: INode) {
	if (chunk.type === 'Text') {
		return escape_template(escape((chunk as Text).data));
	}

	return '${@escape(' + snip(chunk) + ')}';
}

function get_attribute_value(attribute) {
	if (attribute.is_true) return `true`;
	if (attribute.chunks.length === 0) return `''`;

	if (attribute.chunks.length === 1) {
		const chunk = attribute.chunks[0];
		if (chunk.type === 'Text') {
			return stringify(chunk.data);
		}

		return snip(chunk);
	}

	return '`' + attribute.chunks.map(stringify_attribute).join('') + '`';
}

export default function(node: InlineComponent, renderer: Renderer, options: RenderOptions) {
	const binding_props = [];
	const binding_fns = [];

	node.bindings.forEach(binding => {
		renderer.has_bindings = true;

		// TODO this probably won't work for contextual bindings
		const snippet = snip(binding.expression);

		binding_props.push(`${binding.name}: ${snippet}`);
		binding_fns.push(`${binding.name}: $$value => { ${snippet} = $$value; $$settled = false }`);
	});

	const uses_spread = node.attributes.find(attr => attr.is_spread);

	let props;

	if (uses_spread) {
		props = `Object.assign(${
			node.attributes
				.map(attribute => {
					if (attribute.is_spread) {
						return snip(attribute.expression);
					} else {
						return `{ ${attribute.name}: ${get_attribute_value(attribute)} }`;
					}
				})
				.concat(binding_props.map(p => `{ ${p} }`))
				.join(', ')
		})`;
	} else {
		props = stringify_props(
			node.attributes
				.map(attribute => `${attribute.name}: ${get_attribute_value(attribute)}`)
				.concat(binding_props)
		);
	}

	const bindings = stringify_props(binding_fns);

	const expression = (
		node.name === 'svelte:self'
			? '__svelte:self__' // TODO conflict-proof this
			: node.name === 'svelte:component'
				? `((${snip(node.expression)}) || @missing_component)`
				: node.name
	);

	const slot_fns = [];

	if (node.children.length) {
		const target: AppendTarget = {
			slots: { default: '' },
			slot_stack: ['default']
		};

		renderer.targets.push(target);

		const slot_scopes = new Map();
		slot_scopes.set('default', get_slot_scope(node.lets));

		renderer.render(node.children, Object.assign({}, options, {
			slot_scopes
		}));

		Object.keys(target.slots).forEach(name => {
			const slot_scope = slot_scopes.get(name);

			slot_fns.push(
				`${quote_name_if_necessary(name)}: (${slot_scope}) => \`${target.slots[name]}\``
			);
		});

		renderer.targets.pop();
	}

	const slots = stringify_props(slot_fns);

	renderer.append(`\${@validate_component(${expression}, '${node.name}').$$render($$result, ${props}, ${bindings}, ${slots})}`);
}
