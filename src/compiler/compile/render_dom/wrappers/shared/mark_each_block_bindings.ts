import EachBlock from '../../../nodes/EachBlock';
import InlineComponentWrapper from '../InlineComponent';
import ElementWrapper from '../Element';
import Binding from '../../../nodes/Binding';
import compiler_warnings from '../../../compiler_warnings';

export default function mark_each_block_bindings(
	parent: ElementWrapper | InlineComponentWrapper,
	binding: Binding
) {
	// we need to ensure that the each block creates a context including
	// the list and the index, if they're not otherwise referenced
	binding.expression.references.forEach(name => {
		const each_block = parent.node.scope.get_owner(name);
		if (each_block && each_block.type === 'EachBlock') {
			const rest_node = each_block.context_rest_properties.get(name);
			if (rest_node) {
				parent.renderer.component.warn(rest_node as any, compiler_warnings.invalid_rest_eachblock_binding(name));
			}
		}
		if (each_block) {
			(each_block as EachBlock).has_binding = true;
		}
	});

	if (binding.name === 'group') {
		const add_index_binding = (name: string) => {
			const each_block = parent.node.scope.get_owner(name);
			if (each_block.type === 'EachBlock') {
				each_block.has_index_binding = true;
				for (const dep of each_block.expression.contextual_dependencies) {
					add_index_binding(dep);
				}
			}
		};
		// for `<input bind:group={} >`, we make sure that all the each blocks creates context with `index`
		for (const name of binding.expression.contextual_dependencies) {
			add_index_binding(name);
		}
	}
}
