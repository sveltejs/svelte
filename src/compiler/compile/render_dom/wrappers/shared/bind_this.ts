import { b, x } from 'code-red';
import Component from '../../../Component';
import Block from '../../Block';
import BindingWrapper from '../Element/Binding';
import { Identifier } from 'estree';

export default function bind_this(component: Component, block: Block, binding: BindingWrapper, variable: Identifier) {
	const fn = component.get_unique_name(`${variable.name}_binding`);

	block.renderer.add_to_context(fn.name);
	const callee = block.renderer.reference(fn.name);

	const { contextual_dependencies, mutation, lhs } = binding.handler;
	const dependencies = binding.get_dependencies();

	const body = b`
		${mutation}
		${Array.from(dependencies)
			.filter(dep => dep[0] !== '$')
			.filter(dep => !contextual_dependencies.has(dep))
			.map(dep => b`${block.renderer.invalidate(dep)};`)}
	`;

	if (contextual_dependencies.size) {
		const params: Identifier[] = Array.from(contextual_dependencies).map(name => ({
			type: 'Identifier',
			name
		}));
		component.partly_hoisted.push(b`
			function ${fn}($$value, ${params}) {
				if (${lhs} === $$value) return;
				@binding_callbacks[$$value ? 'unshift' : 'push'](() => {
					${body}
				});
			}
		`);

		const args = [];
		for (const id of params) {
			args.push(id);
			if (block.variables.has(id.name)) {
				if (block.renderer.context_lookup.get(id.name).is_contextual) continue;
			}
			block.add_variable(id, block.renderer.reference(id.name));
		}

		const assign = block.get_unique_name(`assign_${variable.name}`);
		const unassign = block.get_unique_name(`unassign_${variable.name}`);

		block.chunks.init.push(b`
			const ${assign} = () => ${callee}(${variable}, ${args});
			const ${unassign} = () => ${callee}(null, ${args});
		`);

		const condition = Array.from(params)
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