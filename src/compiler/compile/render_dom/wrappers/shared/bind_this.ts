import flatten_reference from '../../../utils/flatten_reference';
import deindent from '../../../utils/deindent';
import Component from '../../../Component';
import Block from '../../Block';
import Binding from '../../../nodes/Binding';

export default function bind_this(component: Component, block: Block, binding: Binding, variable: string) {
	const fn = component.get_unique_name(`${variable}_binding`);

	component.add_var({
		name: fn,
		internal: true,
		referenced: true
	});

	let lhs;
	let object;

	if (binding.is_contextual && binding.expression.node.type === 'Identifier') {
		// bind:x={y} — we can't just do `y = x`, we need to
		// to `array[index] = x;
		const { name } = binding.expression.node;
		const { snippet } = block.bindings.get(name);
		lhs = snippet;

		// TODO we need to invalidate... something
	} else {
		object = flatten_reference(binding.expression.node).name;
		lhs = component.source.slice(binding.expression.node.start, binding.expression.node.end).trim();
	}

	const contextual_dependencies = [...binding.expression.contextual_dependencies];

	component.partly_hoisted.push(deindent`
		function ${fn}(${['$$value', ...contextual_dependencies].join(', ')}) {
			${lhs} = $$value;
			${object && component.invalidate(object)}
		}
	`);

	block.builders.destroy.add_line(`ctx.${fn}(${['null', ...contextual_dependencies.map(name => `ctx.${name}`)].join(', ')});`);
	return `@add_binding_callback(() => ctx.${fn}(${[variable, ...contextual_dependencies.map(name => `ctx.${name}`)].join(', ')}));`;
}