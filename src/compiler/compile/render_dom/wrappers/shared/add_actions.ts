import { b, x } from 'code-red';
import Block from '../../Block';
import Action from '../../../nodes/Action';
import Component from '../../../Component';

export default function add_actions(
	component: Component,
	block: Block,
	target: string,
	actions: Action[]
) {
	actions.forEach(action => {
		const { expression } = action;
		let snippet;
		let dependencies;

		if (expression) {
			snippet = expression.manipulate(block);
			dependencies = expression.dynamic_dependencies();
		}

		const id = block.get_unique_name(
			`${action.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_action`
		);

		block.add_variable(id);

		const fn = component.qualify(action.name);

		block.chunks.mount.push(
			b`${id} = ${fn}.call(null, ${target}, ${snippet}) || {};`
		);

		if (dependencies && dependencies.length > 0) {
			let condition = x`@is_function(${id}.update)`;

			// TODO can this case be handled more elegantly?
			if (dependencies.length > 0) {
				let changed = x`#changed.${dependencies[0]}`;
				for (let i = 1; i < dependencies.length; i += 1) {
					changed = x`${changed} || #changed.${dependencies[i]}`;
				}

				condition = x`${condition} && ${changed}`;
			}

			block.chunks.update.push(
				b`if (${condition}) ${id}.update.call(null, ${snippet});`
			);
		}

		block.chunks.destroy.push(
			b`if (${id} && @is_function(${id}.destroy)) ${id}.destroy();`
		);
	});
}
