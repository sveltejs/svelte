import flatten_reference from '../../../utils/flatten_reference';
import { b, x } from 'code-red';
import Component from '../../../Component';
import Block from '../../Block';
import Binding from '../../../nodes/Binding';
import { Identifier } from 'estree';

export default function bind_this(component: Component, block: Block, binding: Binding, variable: Identifier) {
	const fn = component.get_unique_name(`${variable.name}_binding`);

	component.add_var({
		name: fn.name,
		internal: true,
		referenced: true
	});

	let lhs;
	let object;
	let body;

	if (binding.is_contextual && binding.expression.node.type === 'Identifier') {
		// bind:x={y} — we can't just do `y = x`, we need to
		// to `array[index] = x;
		const { name } = binding.expression.node;
		const { snippet } = block.bindings.get(name);
		lhs = snippet;

		body = `${lhs} = $$value`; // TODO we need to invalidate... something
	} else {
		object = flatten_reference(binding.expression.node).name;
		lhs = component.source.slice(binding.expression.node.start, binding.expression.node.end).trim();

		body = binding.expression.node.type === 'Identifier'
			? b`
				${component.invalidate(object, `${lhs} = $$value`)};
			`
			: b`
				${lhs} = $$value;
				${component.invalidate(object)};
			`;
	}

	const contextual_dependencies = Array.from(binding.expression.contextual_dependencies);

	if (contextual_dependencies.length) {
		component.partly_hoisted.push(b`
			function ${fn}(${['$$value', ...contextual_dependencies]}) {
				if (${lhs} === $$value) return;
				@binding_callbacks[$$value ? 'unshift' : 'push'](() => {
					${body}
				});
			}
		`);

		const args = [];
		for (const arg of contextual_dependencies) {
			const id: Identifier = { type: 'Identifier', name: arg };
			args.push(id);
			block.add_variable(id, x`#ctx.${id}`);
		}

		const assign = block.get_unique_name(`assign_${variable.name}`);
		const unassign = block.get_unique_name(`unassign_${variable.name}`);

		block.chunks.init.push(b`
			const ${assign} = () => #ctx.${fn}(${[variable].concat(args)});
			const ${unassign} = () => #ctx.${fn}(${['null'].concat(args)});
		`);

		const condition = Array.from(contextual_dependencies).map(name => `${name} !== #ctx.${name}`).join(' || ');

		// we push unassign and unshift assign so that references are
		// nulled out before they're created, to avoid glitches
		// with shifting indices
		block.chunks.update.push(b`
			if (${condition}) {
				${unassign}();
				${args.map(a => b`${a} = #ctx.${a}`)};
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

	block.chunks.destroy.push(b`#ctx.${fn}(null);`);
	return b`#ctx.${fn}(${variable});`;
}