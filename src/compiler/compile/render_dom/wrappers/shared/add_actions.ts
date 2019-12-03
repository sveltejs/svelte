import { b, x } from 'code-red';
import Block from '../../Block';
import Action from '../../../nodes/Action';

export default function add_actions(
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

		const fn = block.renderer.reference(action.name);

		block.chunks.mount.push(
			b`${id} = ${fn}.call(null, ${target}, ${snippet}) || {};`
		);

		if (dependencies && dependencies.length > 0) {
			let condition = x`@is_function(${id}.update)`;

			if (dependencies.length > 0) {
				condition = x`${condition} && ${block.renderer.dirty(dependencies)}`;
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
