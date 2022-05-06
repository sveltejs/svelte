import { string_literal } from '../../utils/stringify';
import { get_attribute_value } from './shared/get_attribute_value';
import Renderer, { RenderOptions } from '../Renderer';
import InlineComponent from '../../nodes/InlineComponent';
import { p, x } from 'code-red';

function get_prop_value(attribute) {
	if (attribute.is_true) return x`true`;
	if (attribute.chunks.length === 0) return x`''`;

	return attribute.chunks
		.map(chunk => {
			if (chunk.type === 'Text') return string_literal(chunk.data);
			return chunk.node;
		})
		.reduce((lhs, rhs) => x`${lhs} + ${rhs}`);
}

export default function(node: InlineComponent, renderer: Renderer, options: RenderOptions) {
	const binding_props = [];
	const binding_fns = [];

	node.bindings.forEach(binding => {
		renderer.has_bindings = true;

		// TODO this probably won't work for contextual bindings
		const snippet = binding.expression.node;

		binding_props.push(p`${binding.name}: ${snippet}`);
		binding_fns.push(p`${binding.name}: $$value => { ${snippet} = $$value; $$settled = false }`);
	});

	const uses_spread = node.attributes.find(attr => attr.is_spread);

	let props;

	if (uses_spread) {
		props = x`@_Object.assign(${
			node.attributes
				.map(attribute => {
					if (attribute.is_spread) {
						return attribute.expression.node;
					} else {
						return x`{ ${attribute.name}: ${get_prop_value(attribute)} }`;
					}
				})
				.concat(binding_props.map(p => x`{ ${p} }`))
		})`;
	} else {
		props = x`{
			${node.attributes.map(attribute => p`${attribute.name}: ${get_prop_value(attribute)}`)},
			${binding_props}
		}`;
	}

	const bindings = x`{
		${binding_fns}
	}`;

	const expression = (
		node.name === 'svelte:self'
			? renderer.name
			: node.name === 'svelte:component'
				? x`(${node.expression.node}) || @missing_component`
				: node.name.split('.').reduce(((lhs, rhs) => x`${lhs}.${rhs}`) as any)
	);

	const slot_fns = [];

	const children = node.children;

	if (children.length) {
		const slot_scopes = new Map();

		renderer.render(children, Object.assign({}, options, {
			slot_scopes
		}));

		slot_scopes.forEach(({ input, output, statements }, name) => {
			slot_fns.push(
				p`${name}: (${input}) => { ${statements}; return ${output}; }`
			);
		});
	}

	const slots = x`{
		${slot_fns}
	}`;

	if (node.css_custom_properties.length > 0) {
		renderer.add_string('<div style="display: contents;');
		node.css_custom_properties.forEach(attr => {
			renderer.add_string(` ${attr.name}:`);
			renderer.add_expression(get_attribute_value(attr));
			renderer.add_string(';');
		});
		renderer.add_string('">');
	}

	renderer.add_expression(x`@validate_component(${expression}, "${node.name}").$$render($$result, ${props}, ${bindings}, ${slots})`);

	if (node.css_custom_properties.length > 0) {
		renderer.add_string('</div>');
	}
}
