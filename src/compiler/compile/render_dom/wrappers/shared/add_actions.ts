import { b, x } from 'code-red';
import Block from '../../Block';
import Action from '../../../nodes/Action';
import { Expression, Node } from 'estree';
import is_contextual from '../../../nodes/shared/is_contextual';

export default function add_actions(
	block: Block,
	target: string | Expression,
	actions: Action[]
) {
	actions.forEach(action => add_action(block, target, action));
}

const regex_invalid_variable_identifier_characters = /[^a-zA-Z0-9_$]/g;

export function add_action(block: Block, target: string | Expression, action: Action) {
	const { expression, template_scope } = action;
	let snippet: Node | undefined;
	let dependencies: string[] | undefined;

	if (expression) {
		snippet = expression.manipulate(block);
		dependencies = expression.dynamic_dependencies();
	}

	const id = block.get_unique_name(
		`${action.name.replace(regex_invalid_variable_identifier_characters, '_')}_action`
	);

	block.add_variable(id);

	const [obj, ...properties] = action.name.split('.');

	const fn = is_contextual(action.component, template_scope, obj)
		? block.renderer.reference(obj)
		: obj;

	if (properties.length) {
		const member_expression = properties.reduce((lhs, rhs) => x`${lhs}.${rhs}`, fn);
		block.event_listeners.push(
			x`@action_destroyer(${id} = ${member_expression}(${target}, ${snippet}))`
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
