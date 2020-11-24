import { nodes_match } from '../../utils/nodes_match';
import { Scope } from '../utils/scope';
import { x } from 'code-red';
import { Node, Expression } from 'estree';
import Renderer from './Renderer';
import { Var } from '../../interfaces';

export function invalidate(renderer: Renderer, scope: Scope, node: Node, names: Set<string>, main_execution_context: boolean = false) {
	const { component } = renderer;

	const [head, ...tail] = Array.from(names)
		.filter(name => {
			const owner = scope.find_owner(name);
			return !owner || owner === component.instance_scope;
		})
		.map(name => component.var_lookup.get(name))
		.filter(variable =>	{
			return variable && (
				!variable.hoistable &&
				!variable.global &&
				!variable.module &&
				(
					variable.referenced ||
					variable.subscribable ||
					variable.is_reactive_dependency ||
					variable.export_name ||
					variable.name[0] === '$'
				)
			);
		}) as Var[];

	function get_invalidated(variable: Var, node?: Expression) {
		if (main_execution_context && !variable.subscribable && variable.name[0] !== '$') {
			return node;
		}
		return renderer.invalidate(variable.name, undefined, main_execution_context);
	}

	if (!head) {
		return node;
	}

	component.has_reactive_assignments = true;

	if (node.type === 'AssignmentExpression' && node.operator === '=' && nodes_match(node.left, node.right) && tail.length === 0) {
		return get_invalidated(head, node);
	}

	const is_store_value = head.name[0] === '$' && head.name[1] !== '$';
	const extra_args = tail.map(variable => get_invalidated(variable)).filter(Boolean);

	if (is_store_value) {
		return x`@set_store_value(${head.name.slice(1)}, ${node}, ${head.name}, ${extra_args})`;
	}
	
	let invalidate;
	if (!main_execution_context) {
		const pass_value = (
			extra_args.length > 0 ||
			(node.type === 'AssignmentExpression' && node.left.type !== 'Identifier') ||
			(node.type === 'UpdateExpression' && (!node.prefix || node.argument.type !== 'Identifier'))
		);
		if (pass_value) {
			extra_args.unshift({
				type: 'Identifier',
				name: head.name
			});
		}
		invalidate = x`$$invalidate(${renderer.context_lookup.get(head.name).index}, ${node}, ${extra_args})`;
	} else {
		// skip `$$invalidate` if it is in the main execution context
		invalidate = extra_args.length ? [node, ...extra_args] : node;
	}

	if (head.subscribable && head.reassigned) {
		const subscribe = `$$subscribe_${head.name}`;
		invalidate = x`${subscribe}(${invalidate})`;
	}

	return invalidate;
}
