import { string_literal } from '../../utils/stringify';
import Renderer, { RenderOptions } from '../Renderer';
import { get_slot_scope } from './shared/get_slot_scope';
import InlineComponent from '../../nodes/InlineComponent';
import remove_whitespace_children from './utils/remove_whitespace_children';
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

	let attributes = node.attributes
	let classProp
	if (node.classes.length > 0) {
		const index = attributes.findIndex(a => a.name === 'class')
		const attr = attributes[index]
		attributes.splice(index, 1)
		classProp = p`
			class: @component_classnames({
				${node.classes.map(class_directive => {
					const { expression, name } = class_directive;
					const snippet = expression ? expression.node : x`#ctx.${name}`; // TODO is this right?
					return p`${name}: ${snippet}`;
				})},
				${attr ? p`$$class: ${get_prop_value(attr)}` : null}
			})
		`
	}

	if (uses_spread) {
		props = x`@_Object.assign(${
			attributes
				.map(attribute => attribute.is_spread
					? attribute.expression.node
					: x`{ ${attribute.name}: ${get_prop_value(attribute)} }`
				)
			},
			${classProp ? x`{ ${classProp} }` : null},
			${binding_props.map(p => x`{ ${p} }`)}
		)`;
	} else {
		props = x`{
			${attributes.map(attribute => p`${attribute.name}: ${get_prop_value(attribute)}`)},
			${classProp},
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

	const children = remove_whitespace_children(node.children, node.next);

	if (children.length) {
		const slot_scopes = new Map();

		renderer.push();

		renderer.render(children, Object.assign({}, options, {
			slot_scopes
		}));

		slot_scopes.set('default', {
			input: get_slot_scope(node.lets),
			output: renderer.pop()
		});

		slot_scopes.forEach(({ input, output }, name) => {
			if (!is_empty_template_literal(output)) {
				slot_fns.push(
					p`${name}: (${input}) => ${output}`
				);
			}
		});
	}

	const slots = x`{
		${slot_fns}
	}`;

	renderer.add_expression(x`@validate_component(${expression}, "${node.name}").$$render($$result, ${props}, ${bindings}, ${slots})`);
}

function is_empty_template_literal(template_literal) {
	return (
		template_literal.expressions.length === 0 &&
		template_literal.quasis.length === 1 &&
		template_literal.quasis[0].value.raw === ""
	);
}