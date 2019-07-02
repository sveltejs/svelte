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
			? deindent`
				${component.invalidate(object, `${lhs} = $$value`)};
			`
			: deindent`
				${lhs} = $$value;
				${component.invalidate(object)};
			`;
	}

	const contextual_dependencies = Array.from(binding.expression.contextual_dependencies);

	if (contextual_dependencies.length) {
		component.partly_hoisted.push(deindent`
			function ${fn}(${['$$value', ...contextual_dependencies].join(', ')}) {
				if (${lhs} === $$value) return;
				@binding_callbacks[$$value ? 'unshift' : 'push'](() => {
					${body}
				});
			}
		`);

		const args = [];
		for (const arg of contextual_dependencies) {
			args.push(arg);
			block.add_variable(arg, `ctx.${arg}`);
		}

		const assign = block.get_unique_name(`assign_${variable}`);
		const unassign = block.get_unique_name(`unassign_${variable}`);

		block.builders.init.add_block(deindent`
			const ${assign} = () => ctx.${fn}(${[variable].concat(args).join(', ')});
			const ${unassign} = () => ctx.${fn}(${['null'].concat(args).join(', ')});
		`);

		const condition = Array.from(contextual_dependencies).map(name => `${name} !== ctx.${name}`).join(' || ');

		// we push unassign and unshift assign so that references are
		// nulled out before they're created, to avoid glitches
		// with shifting indices
		block.builders.update.add_line(deindent`
			if (${condition}) {
				${unassign}();
				${args.map(a => `${a} = ctx.${a}`).join(', ')};
				${assign}();
			}`
		);

		block.builders.destroy.add_line(`${unassign}();`);
		return `${assign}();`;
	}

	component.partly_hoisted.push(deindent`
		function ${fn}($$value) {
			@binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				${body}
			});
		}
	`);

	block.builders.destroy.add_line(`ctx.${fn}(null);`);
	return `ctx.${fn}(${variable});`;
}