import { b } from 'code-red';
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
			snippet = expression.render(block);
			dependencies = expression.dynamic_dependencies();
		}

		const id = block.get_unique_name(
			`${action.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_action`
		);

		block.add_variable(id);

		const fn = component.qualify(action.name);

		block.chunks.mount.push(
			b`${id} = ${fn}.call(null, ${target}${snippet ? `, ${snippet}` : ''}) || {};`
		);

		if (dependencies && dependencies.length > 0) {
			let conditional = `typeof ${id}.update === 'function' && `;
			const deps = dependencies.map(dependency => `changed.${dependency}`).join(' || ');
			conditional += dependencies.length > 1 ? `(${deps})` : deps;

			block.chunks.update.push(
				b`if (${conditional}) ${id}.update.call(null, ${snippet});`
			);
		}

		block.chunks.destroy.push(
			b`if (${id} && typeof ${id}.destroy === 'function') ${id}.destroy();`
		);
	});
}
