import Component from '../Component';
import { nodes_match } from '../../utils/nodes_match';
import { Scope } from './scope';
import { x } from 'code-red';
import { Node } from 'estree';

export function invalidate(component: Component, scope: Scope, node: Node, names: Set<string>) {
	const [head, ...tail] = Array.from(names).filter(name => {
		const owner = scope.find_owner(name);
		if (owner && owner !== component.instance_scope) return false;

		const variable = component.var_lookup.get(name);

		return variable && (
			!variable.hoistable &&
			!variable.global &&
			!variable.module &&
			(
				variable.referenced ||
				variable.is_reactive_dependency ||
				variable.export_name ||
				variable.name[0] === '$'
			)
		);
	});

	if (head) {
		component.has_reactive_assignments = true;

		if (node.type === 'AssignmentExpression' && node.operator === '=' && nodes_match(node.left, node.right) && tail.length === 0) {
			return component.invalidate(head);
		} else {
			const is_store_value = head[0] === '$';
			const variable = component.var_lookup.get(head);

			const extra_args = tail.map(name => component.invalidate(name));

			const pass_value = (
				extra_args.length > 0 ||
				(node.type === 'AssignmentExpression' && node.left.type !== 'Identifier') ||
				(node.type === 'UpdateExpression' && !node.prefix)
			);

			if (pass_value) {
				extra_args.unshift({
					type: 'Identifier',
					name: head
				});
			}

			const callee = is_store_value ? `@set_store_value` : `$$invalidate`;
			let invalidate = x`${callee}(${is_store_value ? head.slice(1) : x`"${head}"`}, ${node}, ${extra_args})`;

			if (variable.subscribable && variable.reassigned) {
				const subscribe = `$$subscribe_${head}`;
				invalidate = x`${subscribe}(${invalidate})}`;
			}

			return invalidate;
		}
	}

	return node;
}