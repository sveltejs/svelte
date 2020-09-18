import { b, x } from 'code-red';
import Block from '../../Block';
import Action from '../../../nodes/Action';

export default function add_actions(
	block: Block,
	target: string,
	actions: Action[]
) {
	actions.forEach(action => add_action(block, target, action));
}

export function add_action(block: Block, target: string, action: Action) {
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

	const [obj, ...properties] = action.name.split('.');

	const fn = block.renderer.reference(obj);

	if (properties.length) {
		block.event_listeners.push(
			x`@action_destroyer(${id} = ${fn}.${properties.join('.')}(${target}, ${snippet}))`
		);
	} else {
		block.event_listeners.push(
			x`@action_destroyer(${id} = ${fn}.call(null, ${target}, ${snippet}))`
		);
	}

	if (dependencies && dependencies.length > 0) {
		let condition = x`${id} && @is_function(${id}.update)`;

		if (dependencies.length > 0) {
			condition = x`${condition} && ${block.renderer.dirty(dependencies)}`;
		}

		block.chunks.update.push(
			b`if (${condition}) ${id}.update.call(null, ${snippet});`
		);
	}
}
