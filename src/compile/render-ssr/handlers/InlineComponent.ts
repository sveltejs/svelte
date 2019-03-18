import { escape, escapeTemplate, stringify } from '../../../utils/stringify';
import { quote_name_if_necessary } from '../../../utils/names';
import { snip } from '../../../utils/snip';
import Renderer from '../Renderer';
import { stringify_props } from '../../utils/stringify_props';
import { get_slot_scope } from './shared/get_slot_scope';

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
		props = stringify_props(
			node.attributes
				.map(attribute => `${attribute.name}: ${getAttributeValue(attribute)}`)
				.concat(binding_props)
		);
	}

	const bindings = stringify_props(binding_fns);

	const expression = (
		node.name === 'svelte:self'
			? '__svelte:self__' // TODO conflict-proof this
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