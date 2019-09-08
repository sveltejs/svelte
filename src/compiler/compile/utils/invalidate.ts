import Component from '../Component';
import MagicString from 'magic-string';
import { Node } from '../../interfaces';
import { nodes_match } from '../../utils/nodes_match';
import { Scope } from './scope';

export function invalidate(component: Component, scope: Scope, code: MagicString, node: Node, names: Set<string>) {
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

		if (node.operator === '=' && nodes_match(node.left, node.right) && tail.length === 0) {
			code.overwrite(node.start, node.end, component.invalidate(head));
		} else {
			let suffix = ')';

			if (head[0] === '$') {
				code.prependRight(node.start, `${component.helper('set_store_value')}(${head.slice(1)}, `);
			} else {
				let prefix = `$$invalidate`;

				const variable = component.var_lookup.get(head);
				if (variable.subscribable && variable.reassigned) {
					prefix = `$$subscribe_${head}($$invalidate`;
					suffix += `)`;
				}

				code.prependRight(node.start, `${prefix}('${head}', `);
			}

			const extra_args = tail.map(name => component.invalidate(name));

			const pass_value = (
				extra_args.length > 0 ||
				(node.type === 'AssignmentExpression' && node.left.type !== 'Identifier') ||
				(node.type === 'UpdateExpression' && !node.prefix)
			);

			if (pass_value) {
				extra_args.unshift(head);
			}

			suffix = `${extra_args.map(arg => `, ${arg}`).join('')}${suffix}`;

			code.appendLeft(node.end, suffix);
		}
	}
}