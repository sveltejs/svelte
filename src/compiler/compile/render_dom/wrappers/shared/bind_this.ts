import flatten_reference from '../../../utils/flatten_reference';
import { b, x } from 'code-red';
import Component from '../../../Component';
import Block from '../../Block';
import Binding from '../../../nodes/Binding';
import { Identifier } from 'estree';

export default function bind_this(component: Component, block: Block, binding: Binding, variable: Identifier) {
	const fn = component.get_unique_name(`${variable.name}_binding`);

	block.renderer.add_to_context(fn.name);
	const callee = block.renderer.reference(fn.name);

	let lhs;
	let object;
	let body;

	if (binding.is_contextual && binding.raw_expression.type === 'Identifier') {
		// bind:x={y} — we can't just do `y = x`, we need to
		// to `array[index] = x;
		const { name } = binding.raw_expression;
		const { snippet } = block.bindings.get(name);
		lhs = snippet;

		body = b`${lhs} = $$value`; // TODO we need to invalidate... something
	} else {
		object = flatten_reference(binding.raw_expression).name;
		lhs = binding.raw_expression;

		body = binding.raw_expression.type === 'Identifier'
			? b`
				${block.renderer.invalidate(object, x`${lhs} = $$value`)};
			`
			: b`
				${lhs} = $$value;
				${block.renderer.invalidate(object)};
			`;
	}

	const contextual_dependencies: Identifier[] = Array.from(binding.expression.contextual_dependencies).map(name => ({
		type: 'Identifier',
		name
	}));

	if (contextual_dependencies.length) {
		component.partly_hoisted.push(b`
			function ${fn}($$value, ${contextual_dependencies}) {
				if (${lhs} === $$value) return;
				@binding_callbacks[$$value ? 'unshift' : 'push'](() => {
					${body}
				});
			}
		`);

		const args = [];
		for (const id of contextual_dependencies) {
			args.push(id);
			block.add_variable(id, block.renderer.reference(id.name));
		}

		const assign = block.get_unique_name(`assign_${variable.name}`);
		const unassign = block.get_unique_name(`unassign_${variable.name}`);

		block.chunks.init.push(b`
			const ${assign} = () => ${callee}(${variable}, ${args});
			const ${unassign} = () => ${callee}(null, ${args});
		`);

		const condition = Array.from(contextual_dependencies)
			.map(name => x`${name} !== ${block.renderer.reference(name.name)}`)
			.reduce((lhs, rhs) => x`${lhs} || ${rhs}`);

		// we push unassign and unshift assign so that references are
		// nulled out before they're created, to avoid glitches
		// with shifting indices
		block.chunks.update.push(b`
			if (${condition}) {
				${unassign}();
				${args.map(a => b`${a} = ${block.renderer.reference(a.name)}`)};
				${assign}();
			}`
		);

		block.chunks.destroy.push(b`${unassign}();`);
		return b`${assign}();`;
	}

	component.partly_hoisted.push(b`
		function ${fn}($$value) {
			@binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				${body}
			});
		}
	`);

	block.chunks.destroy.push(b`${callee}(null);`);
	return b`${callee}(${variable});`;
}