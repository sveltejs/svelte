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

		const name = block.get_unique_name(
			`${action.name.replace(/[^a-zA-Z0-9_$]/g, '_')}_action`
		);

		block.add_variable(name);

		const fn = component.qualify(action.name);

		block.builders.mount.add_line(
			`${name} = ${fn}.call(null, ${target}${snippet ? `, ${snippet}` : ''}) || {};`
		);

		if (dependencies && dependencies.length > 0) {
			let conditional = `typeof ${name}.update === 'function' && `;
			const deps = dependencies.map(dependency => `changed.${dependency}`).join(' || ');
			conditional += dependencies.length > 1 ? `(${deps})` : deps;

			block.builders.update.add_conditional(
				conditional,
				`${name}.update.call(null, ${snippet});`
			);
		}

		block.builders.destroy.add_line(
			`if (${name} && typeof ${name}.destroy === 'function') ${name}.destroy();`
		);
	});
}
